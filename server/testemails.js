// Looking to send emails in production? Check out our Email API/SMTP product!
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const sendMail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    mailOptions.from = process.env.MAIL_USER;

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Error sending mail: ${error.message}`);
  }
};

const recipients = ['test@gmail.com'];

sendMail({
  to: recipients,
  subject: 'You are awesome!',
  text: 'Congrats for sending test email with Mailtrap!',
  html: `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <h1 style="color: #007bff; margin: 0;">Cronos&#8986;</h1>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; line-height: 1.6; font-family: Arial, sans-serif;">
            <p style="margin: 0;">Hi there,</p>
            <p style="margin: 0;">
              Please click the button below to verify your email address and activate your account.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 20px;">
            <a href="${
              process.env.SERVER_URL
            }/api/auth/verify-email/${'123456'}"
  }" 
               style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify Email
            </a>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 20px; font-size: 12px; color: #888888;">
            <p style="margin: 0;">If you didn't request this email, please ignore it.</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 20px; font-size: 12px; color: #888888;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cronos. All rights reserved.</p>
            
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

    `,
  category: 'Integration Test',
  sandbox: true,
}).then(console.log, console.error);
