import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const testEmail = async () => {
  console.log("Starting email test...");
  console.log("User:", process.env.EMAIL_USER);
  console.log("Pass exists:", !!process.env.EMAIL_PASS);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: "Test Email from E-Commerce App",
      text: "If you are reading this, the email sending works!",
    });

    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending email:");
    console.error(error);
  }
};

testEmail();
