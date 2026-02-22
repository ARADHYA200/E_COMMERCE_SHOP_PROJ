import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const testSecondaryEmail = async () => {
  console.log("Starting secondary email test...");
  
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
      to: "testantigravity123@gmail.com", // Send to a different address to simulate new user
      subject: "Test Secondary Email from E-Commerce App",
      text: "Testing sending to an address different from the sender.",
    });

    console.log("Secondary Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending secondary email:");
    console.error(error);
  }
};

testSecondaryEmail();
