const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let html = undefined;
  if (options.template) {
    const templatePath = path.join(__dirname, '../templates', `${options.template}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    html = template({ ...options.data, year: new Date().getFullYear() });
  }

  // Define the email options
  const mailOptions = {
    from: `Wuragold Foundation <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
