import axios from "axios";

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "E-Commerce Shop",
          email: "aradhyaagarwal2k131987@gmail.com",
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("Email Sent:", response.data);
  } catch (error) {
    console.error(
      "Brevo API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export default sendEmail;


// import nodemailer from "nodemailer";

// const sendEmail = async (to, subject, html) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp-relay.brevo.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
  
// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS EXISTS:", !!process.env.EMAIL_PASS);

//   const info = await transporter.sendMail({
//     from: '"E-Commerce Shop" <aradhyaagarwal2k131987@gmail.com>',
//     to,
//     subject,
//     html,
//   });

//   console.log("Email Sent:", info.messageId);
// };

// export default sendEmail;