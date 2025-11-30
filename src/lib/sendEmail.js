import process from "node:process";
import nodemailer from "nodemailer";

export function generateRandomToken(length = 12) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function createTransporter() {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(config);
}

export async function sendPasswordResetEmail(toEmail, token) {
  const transporter = createTransporter();
  const appUrl = process.env.APP_URL;
  const fromEmail = process.env.FROM_EMAIL;

  const resetLink = `${appUrl}/reset-password?email=${encodeURIComponent(
    toEmail
  )}&token=${token}`;

  const mailOptions = {
    from: fromEmail,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
        <html>
          <body>
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to reset your password:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you did not request this, please ignore this email.</p>
          </body>
        </html>
      `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
