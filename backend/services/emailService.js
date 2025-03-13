const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAuthEmail = async (userEmail, verificationUrl) => {
  const mailOptions = {
    from: `Career Crafting Team <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify Your Email",
    html: `<h3>Welcome to Arvo!</h3>
           <p>Click the link below to verify your email:</p>
           <a href="${verificationUrl}">Verify Email</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendAuthEmail;
