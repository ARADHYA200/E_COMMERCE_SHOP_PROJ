
import PriceAlert from "../models/PriceAlert.js";
import PriceAlertNotification from "../models/PriceAlertNotification.js";
import sendEmail from "./sendEmail.js";

const FRONTEND_URL =
  process.env.CLIENT_URL || "https://e-commerce-shop-proj.vercel.app";

const notifyProductChange = async ({
  product,
  oldPrice,
  newPrice,
  oldStock,
  newStock,
}) => {
  if (!product?._id) return;

  const priceDropped = newPrice < oldPrice;
  const backInStock = oldStock <= 0 && newStock > 0;

  if (!priceDropped && !backInStock) return;

  const alerts = await PriceAlert.find({
    product: product._id,
  }).populate("user", "name email");

  for (const alert of alerts) {
    const email = alert.user?.email;
    if (!email) continue;

    const events = [];

    if (
      priceDropped &&
      alert.priceDropEnabled &&
      (alert.targetPrice == null || newPrice <= alert.targetPrice) &&
      alert.lastNotifiedPrice !== newPrice
    ) {
      events.push("price_drop");
    }

    if (backInStock && alert.backInStockEnabled) {
      events.push("back_in_stock");
    }

    for (const eventType of events) {
      const eventKey = `${product.updatedAt?.getTime() || Date.now()}-${eventType}`;

      const subject =
        eventType === "price_drop"
          ? `Price Drop Alert: ${product.name}`
          : `Back in Stock: ${product.name}`;

      const details =
        eventType === "price_drop"
          ? `<p>Previous price: <strong>₹${oldPrice}</strong></p>
             <p>New price: <strong>₹${newPrice}</strong></p>`
          : `<p>This product is back in stock!</p>
             <p>Current price: <strong>₹${newPrice}</strong></p>`;

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2>${eventType === "price_drop" ? "Good news! The price has dropped 🎉" : "Your wishlist product is back! 🎉"}</h2>
          <p>Hi ${alert.user.name || "there"},</p>
          <p><strong>${product.name}</strong></p>
          ${details}
          <p><a href="${FRONTEND_URL}/wishlist">View Wishlist</a></p>
        </div>
      `;

      try {
        // Create the reminder record only after the initial email succeeds.
        await sendEmail(email, subject, html);

        await PriceAlertNotification.create({
          user: alert.user._id,
          product: product._id,
          eventType,
          eventKey,
          email,
          userName: alert.user.name || "there",
          productName: product.name,
          oldPrice: eventType === "price_drop" ? oldPrice : null,
          newPrice,
          initialSentAt: new Date(),
          reminderAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (eventType === "price_drop") {
          await PriceAlert.updateOne(
            { _id: alert._id },
            { $set: { lastNotifiedPrice: newPrice } }
          );
        }
      } catch (error) {
        console.error(
          `Alert email/scheduling failed for ${email}:`,
          error.message
        );
      }
    }
  }
};

export default notifyProductChange;
