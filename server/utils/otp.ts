import { emailTemplates, sendMail } from './mailer';

function createOneTimePassword(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
}

async function sendOtpEmail({
  email,
  name,
  otp,
}: {
  email: string;
  name: string;
  otp: string;
}) {
  await sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Your OTP',
    text: `Your OTP is ${otp}`,
    html: emailTemplates.otp(name, otp),
  });
}

export { createOneTimePassword, sendOtpEmail };
