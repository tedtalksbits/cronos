//utils/auth.ts
import jwt from 'jsonwebtoken';
import User from '../features/users/models';
import logger from './logger';
import bcrypt from 'bcrypt';
import { sendMail } from './mailer';
export type JwtPayload = {
  userId: string;
  role: 'User' | 'Admin';
  status: 'Active' | 'Inactive';
};
export const generateAuthToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '3d',
  });
};

export const verifyAuthToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};

export const createServerAdminAccount = async () => {
  if (
    !process.env.SERVER_ADMIN_FIRSTNAME ||
    !process.env.SERVER_ADMIN_LASTNAME ||
    !process.env.SERVER_ADMIN_EMAIL ||
    !process.env.SERVER_ADMIN_PASSWORD ||
    !process.env.SERVER_ADMIN_PHONE
  ) {
    console.error('Admin account details are missing');
    logger.error(
      'Admin account details are missing, please check the environment variables'
    );
    return;
  }
  // Check if the admin account already exists
  const admin = await User.findOne({ role: 'Admin', isSuper: true });
  if (admin) {
    console.log('Admin account already exists');
    return;
  }
  logger.info('Creating admin account');
  logger.info('Creating admin account with the following details:');
  logger.info(`First Name: ${process.env.SERVER_ADMIN_FIRSTNAME}`);
  logger.info(`Last Name: ${process.env.SERVER_ADMIN_LASTNAME}`);
  logger.info(`Email: ${process.env.SERVER_ADMIN_EMAIL}`);
  // Create the admin account
  // hash password
  const hashedPassword = await bcrypt.hash(
    process.env.SERVER_ADMIN_PASSWORD,
    10
  );
  const newAdmin = new User({
    firstName: process.env.SERVER_ADMIN_FIRSTNAME,
    lastName: process.env.SERVER_ADMIN_LASTNAME,
    email: process.env.SERVER_ADMIN_EMAIL,
    password: hashedPassword,
    phone: process.env.SERVER_ADMIN_PHONE,
    role: 'Admin',
    isSuper: true,
    status: 'Active',
  });

  await newAdmin.save();
  console.log('Admin account created');
  logger.info('Admin account created');

  // send email verification
  await sendMail({
    to: newAdmin.email,
    subject: 'Welcome to the application',
    text: `Hello ${newAdmin.firstName}, Your admin account has been created successfully.`,
    html: `
      <h1>Cronos⌚</h1>
      <p>Hello ${newAdmin.firstName},</p><p>Your admin account has been created successfully.</p>
      <h2>Actions:</h2>
      <a href="${process.env.SERVER_URL}/api/auth/verify-email/${newAdmin._id}">Verify Email</a>
      `,
  });
};

export const createClientEmailVerificationURL = ({
  status,
  title,
  description,
  suggestion,
}: {
  status: 'success' | 'error' | 'info';
  title: string;
  description: string;
  suggestion: string;
}) => {
  return `${process.env.CLIENT_URL}/email-verification?status=${status}&title=${title}&description=${description}&suggestion=${suggestion}`;
};
