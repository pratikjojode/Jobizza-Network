import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!options) {
    throw new Error("Email options are required");
  }

  if (!options.email) {
    throw new Error("Recipient email is required");
  }

  if (!options.subject) {
    throw new Error("Email subject is required");
  }

  if (!options.html && !options.text) {
    throw new Error("Email content (html or text) is required");
  }

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error(
      "Email configuration missing: MAIL_USER or MAIL_PASS not set"
    );
  }

  const transporter = nodemailer.createTransport({
    host:
      process.env.MAIL_SERVICE === "zoho" ? "smtppro.zoho.in" : "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: `Jobizaaa Network <${process.env.MAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;
