// mailer.js

const nodemailer = require("nodemailer");
const { 
  MAIL_TEMPLATE_TEST,
  MAIL_TEMPLATE_REGISTRATION,
  MAIL_TEMPLATE_WELCOME,
  MAIL_TEMPLATE_RESET_PASSWORD
} = require("./mail_template");
const { registermailtoken, forgotmailtoken } = require("../auth/tokenCreation");

// Set up Brevo as the transport for Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Function to send a test email using the test email template
const sendTestEmail = async ({ to, name, testMessage, from }) => {
  const html = MAIL_TEMPLATE_TEST({ name, testMessage });
  const mailOptions = {
    from: from || process.env.EMAIL_FROM,
    to,
    subject: "Test Email from Career AI Backend",
    html,
  };
  return transporter.sendMail(mailOptions);
};

const sendregisterEmail = async (email, name, phone) => {
  try {
    console.log("sendregisterEmail");

    const tokenData = { email, name, phone };
    const token = await registermailtoken(tokenData);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=register`;

    const html = MAIL_TEMPLATE_REGISTRATION({
      name,
      verificationUrl,
      guideUrl: "#",
      faqUrl: "#",
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Career AI – Verify Your Account',
      text: `Hello ${name},\n\nWelcome! Click the link below to verify your email and set your password:\n\n${verificationUrl}`,
      html 
    };

   
    await transporter.sendMail(mailOptions);
    console.log("Register email sent successfully ✅");

  } catch (error) {
    console.error("Error sending register email ❌:", error.response || error);
    throw new Error('Error sending register email');
  }
};

const sendForgotEmail = async (email, name) => {
  try {
    console.log("sendForgotEmail");
    
    const tokenData = { email, name };
    const token = await forgotmailtoken(tokenData);
    console.log(token);

    const resetUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=forgot`;

    const html = MAIL_TEMPLATE_RESET_PASSWORD({
      name,
      resetUrl,
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Career AI – Password Reset Request',
      text: `Hello ${name},\n\nWe received a request to reset your password. Click the link below to proceed:\n\n${resetUrl}`,
      html 
    };
    await transporter.sendMail(mailOptions);
    console.log("Forgot password email sent successfully ✅");
  } catch (error) {
    console.error("Error sending forgot password email ❌:", error.response || error);
    throw new Error('Error sending forgot password email');
  }
};

const sendWelcomeMail = async (email, name) => {
  try {
    console.log("sendWelcomeMail");
    const html = MAIL_TEMPLATE_WELCOME({ name });
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Career AI!",
      html,
    };
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully ✅");
  } catch (error) {
    console.error("Error sending welcome email ❌:", error.response || error);
    throw new Error('Error sending welcome email');
  }
};

module.exports = {
  sendTestEmail,
  transporter,
  sendregisterEmail,
  sendForgotEmail,
  sendWelcomeMail
};
