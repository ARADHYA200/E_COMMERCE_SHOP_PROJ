
import PriceAlertNotification from "../models/PriceAlertNotification.js";
import sendEmail from "./sendEmail.js";

const FRONTEND_URL =
  process.env.CLIENT_URL || "https://e-commerce-shop-proj.vercel.app";

const processPriceAlertReminders = async () => {
  try {
    const dueReminders = await PriceAlertNotification.find({
      reminderAt: { $lte: new Date() },
      reminderSentAt: null,
    }).limit(100);

    for (const reminder of dueReminders) {
      // Claim this reminder atomically so concurrent workers don't both send it.
      const claimed = await PriceAlertNotification.findOneAndUpdate(
        {
          _id: reminder._id,
          reminderSentAt: null,
          reminderAt: { $lte: new Date() },
        },
        { $set: { reminderSentAt: new Date() } },
        { returnDocument: "after" }
      );

      if (!claimed) continue;

      const subject =
        reminder.eventType === "price_drop"
          ? `Reminder: ${reminder.productName} price dropped`
          : `Reminder: ${reminder.productName} is back in stock`;

      const details =
        reminder.eventType === "price_drop"
          ? `The price changed from ₹${reminder.oldPrice} to ₹${reminder.newPrice}.`
          : `The product was back in stock when we notified you.`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2>Wishlist reminder 🔔</h2>
          <p>Hi ${reminder.userName},</p>
          <p>This is your 24-hour reminder about <strong>${reminder.productName}</strong>.</p>
          <p>${details}</p>
          <p><a href="${FRONTEND_URL}/wishlist">View Wishlist</a></p>
        </div>
      `;

      try {
        await sendEmail(reminder.email, subject, html);
      } catch (error) {
        // Restore pending status so a later worker run can retry.
        await PriceAlertNotification.updateOne(
          { _id: reminder._id, reminderSentAt: claimed.reminderSentAt },
          { $set: { reminderSentAt: null } }
        );

        console.error(
          `Reminder email failed for ${reminder.email}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("Reminder worker error:", error.message);
  }
};

export default processPriceAlertReminders;
