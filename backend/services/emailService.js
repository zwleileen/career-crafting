const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAuthEmail = async (userEmail, token) => {
  const link = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Verify Your Email",
    html: `<h3>Welcome to Arvo!</h3>
           <p>Click the link below to verify your email:</p>
           <a href="${link}">Verify Email</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendAuthEmail;
