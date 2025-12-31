// Common styles for all mail templates
const COMMON_STYLES = `
  body {
    font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
    background: #f6f8fb;
    margin: 0;
    padding: 0;
    color: #374151;
  }
  .container {
    max-width: 520px;
    margin: 40px auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px #e0e0e0;
    padding: 36px 28px;
  }
  .header {
    text-align: center;
    margin-bottom: 24px;
  }
  .header h1 {
    color: #2563eb;
    margin: 0;
    font-size: 2.2rem;
  }
  .content {
    color: #4b5563;
    font-size: 1.13rem;
    margin-bottom: 32px;
    line-height: 1.7;
  }
  .button {
    display: block;
    width: 220px;
    margin: 0 auto;
    background: #2563eb;
    color: #fff;
    text-decoration: none;
    padding: 15px 0;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.08rem;
    text-align: center;
    transition: background 0.2s;
    box-shadow: 0 1px 4px #e0e0e0;
  }
  .button:hover {
    background: #1d4ed8;
  }
  .footer {
    text-align: center;
    color: #6b7280;
    font-size: 0.98rem;
    margin-top: 36px;
  }
  @media (prefers-color-scheme: dark) {
    body {
      background: #181a1b;
      color: #e5e7eb;
    }
    .container {
      background: #23272b;
      box-shadow: 0 2px 12px #111827;
    }
    .header h1 {
      color: #60a5fa;
    }
    .content {
      color: #d1d5db;
    }
    .button {
      background: #3b82f6;
      color: #fff;
    }
    .button:hover {
      background: #2563eb;
    }
    .footer {
      color: #9ca3af;
    }
  }
`;

// Registration Email Template
const MAIL_TEMPLATE_REGISTRATION = ({ name, hotelName, verificationUrl }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Registration Successful</title>
    <style>${COMMON_STYLES}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to ${hotelName || "Career AI"}!</h1>
      </div>
      <div class="content">
        <p>Hello, ${name}!</p>
        <p>
          We're thrilled to have you join the ${
            hotelName || "Career AI"
          } family!<br /><br />
          To get started and enjoy seamless access to our booking and management
          services, please verify your email address by clicking the button
          below.
        </p>
        <p>
          <strong>Why verify?</strong><br />
          Verifying your email helps us keep your account secure and ensures you
          receive important updates about your bookings and account activity.
        </p>
        <p style="color: #ef4444; font-size: 0.98rem">
          <em>
            This verification link will expire in the next 5 minutes. Please do
            not share this link with anyone for security reasons.
          </em>
        </p>
      </div>
      <a href="${verificationUrl}" class="button">Verify Email</a>
      <div class="footer">
        <p>
          Thank you for joining us!<br />
          Best Regards,<br />
          The ${hotelName || "Career AI"} Team
        </p>
        <p style="margin-top: 18px">
          If you did not create this account, please ignore this email or
          contact our support team.
        </p>
      </div>
    </div>
  </body>
</html>
`;

// Welcome Email Template
const MAIL_TEMPLATE_WELCOME = ({ name, hotelName }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome</title>
    <style>${COMMON_STYLES}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to ${hotelName || "Career AI"}!</h1>
      </div>
      <div class="content">
        <p>Hello, ${name}!</p>
        <p>
          We're absolutely delighted to welcome you to the ${
            hotelName || "Career AI"
          } family!<br><br>
          Your account has been successfully created, and you now have access to a seamless booking and management experience.
        </p>
        <p>
          <strong>What can you do next?</strong><br>
          - Explore our platform and discover all the features designed to make your booking process easy and efficient.<br>
          - Manage your bookings, receive timely notifications, and enjoy a secure, user-friendly environment.
        </p>
        <p>
          If you have any questions or need assistance, our support team is always here to help you.
        </p>
      </div>
      <div class="footer">
        <p>
          Thank you for joining us!<br>
          Best Regards,<br>
          The ${hotelName || "Career AI"} Team
        </p>
      </div>
    </div>
  </body>
</html>
`;

// Reset Password Email Template
const MAIL_TEMPLATE_RESET_PASSWORD = ({ name, hotelName, resetUrl }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>${COMMON_STYLES}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Reset Your Password</h1>
      </div>
      <div class="content">
        <p>Hello, ${name}!</p>
        <p>
          We received a request to reset your ${
            hotelName || "Career AI"
          } account
          password.<br /><br />
          For your security, we recommend choosing a strong and unique password
          that you haven't used elsewhere.
        </p>
        <p>
          <strong>How to reset your password?</strong><br />
          Simply click the button below to set a new password. This link will
          expire in the next 5 minutes for your protection.
        </p>
        <p style="color: #ef4444; font-size: 0.98rem">
          <em>
            If you did not request a password reset, please ignore this email
            or contact our support team immediately.
          </em>
        </p>
      </div>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <div class="footer">
        <p>
          Thank you for using ${hotelName || "Career AI"}!<br />
          Best Regards,<br />
          The ${hotelName || "Career AI"} Team
        </p>
      </div>
    </div>
  </body>
</html>
`;

// Test Email Template (unchanged)
const MAIL_TEMPLATE_TEST = ({ name, testMessage }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Email</title>
</head>
<body>
    <h2>Hello, ${name}!</h2>
    <p>This is a test email from Career AI Backend.</p>
    <p>${testMessage}</p>
    <footer>
        <p>Thank you for using our service.</p>
    </footer>
</body>
</html>
`;

module.exports = {
  MAIL_TEMPLATE_REGISTRATION,
  MAIL_TEMPLATE_WELCOME,
  MAIL_TEMPLATE_RESET_PASSWORD,
  MAIL_TEMPLATE_TEST,
  COMMON_STYLES,
};
