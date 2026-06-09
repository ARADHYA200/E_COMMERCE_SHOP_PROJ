import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS EXISTS:", !!process.env.EMAIL_PASS);

  const info = await transporter.sendMail({
    from: '"E-Commerce Shop" <aradhyaagarwal2k131987@gmail.com>',
    to,
    subject,
    html,
  });

  console.log("Email Sent:", info.messageId);
};

export default sendEmail;