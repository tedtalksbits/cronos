// users/controllers.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
// import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

// import { generateSecret, verifyToken } from '../../utils/speakeasy';
import { sendRestResponse } from '../../utils/rest';
import {
  createClientEmailVerificationURL,
  generateAuthToken,
} from '../../utils/auth';
import logger from '../../utils/logger';
import User from './models';
import OTP from '../otp/models';
import { createOneTimePassword, sendOtpEmail } from '../../utils/otp';
import { emailTemplates, sendMail } from '../../utils/mailer';

export const generateOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendRestResponse({
      status: 400,
      message: 'Email is required',
      res,
    });
  }

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }

    const otpCode = createOneTimePassword();

    // see if otp exists
    const existingOTP = await OTP.findOne({
      userId: user._id,
    });

    if (existingOTP) {
      // delete existing otp
      await OTP.findByIdAndDelete(existingOTP._id);
    }
    const otp = new OTP({
      otp: otpCode,
      userId: user._id,
    });
    await otp.save();

    // send email to user
    await sendOtpEmail({ email, name: user.firstName, otp: otpCode });

    return sendRestResponse({
      status: 200,
      message: 'OTP sent successfully',
      res,
    });
  } catch (error) {
    logger.error('Error generating OTP', error);
    return sendRestResponse({
      status: 500,
      message: 'Error generating OTP',
      res,
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return sendRestResponse({
      status: 400,
      message: 'Email and OTP are required',
      res,
    });
  }

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }

    const existingOTP = await OTP.findOne({
      userId: user._id,
      otp,
    });

    if (!existingOTP) {
      return sendRestResponse({
        status: 404,
        message: 'OTP not found',
        res,
      });
    }

    // delete otp
    await OTP.findByIdAndDelete(existingOTP._id);

    return sendRestResponse({
      status: 200,
      message: 'OTP verified successfully',
      res,
    });
  } catch (error) {
    logger.error('Error verifying OTP', error);
    return sendRestResponse({
      status: 500,
      message: 'Error verifying OTP',
      res,
    });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // validation
  if (!email || !password || !firstName || !lastName || !phone) {
    return sendRestResponse({
      status: 400,
      message: 'Please enter all fields',
      res,
    });
  }

  // Check for existing user
  const user = await User.findOne({
    email,
  });
  if (user) {
    return sendRestResponse({
      status: 400,
      message: 'User already exists',
      res,
    });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });
    await user.save();

    // send email to admin for approval
    const adminEmail = process.env.SERVER_ADMIN_EMAIL;

    if (!adminEmail) {
      logger.error('Admin email not set');
      return sendRestResponse({
        status: 500,
        message: 'Something went wrong, please try again or contact the admin',
        res,
      });
    }

    try {
      logger.info('Sending email to admin for user approval');
      logger.info('Admin email: ', adminEmail);
      logger.info('User email: ', email);
      logger.info('SERVER_URL: ', process.env.SERVER_URL);
      // send email to user
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: adminEmail,
        subject: 'New User Registration Approval Needed',
        text: `User ${email} has registered and is awaiting approval.`,
        html: `
        <h1>Cronos⌚</h1>
        <p>User ${email} has registered and is awaiting approval.</p>

        <h2>User Details:</h2>
        <p>First Name: ${firstName}</p>
        <p>Last Name: ${lastName}</p>
        <p>Email: ${email}</p>
        <p>Phone: ${phone}</p>

        <h2>Actions:</h2>
        <p>Click the link below to approve the user:</p>
        <a href="${process.env.SERVER_URL}/api/auth/approve/${user._id}">Approve User</a>
      `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      logger.error('Error sending email during registration', error);
    }

    return sendRestResponse({
      status: 201,
      message: 'User created',
      data: null,
      res,
    });
  } catch (error) {
    logger.error('Error creating user', error);
    return sendRestResponse({
      status: 500,
      message: 'Something went wrong, please try again or contact the admin',
      res,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, token } = req.body;

  // validation
  if (!email || !password || !token) {
    return sendRestResponse({
      status: 400,
      message: 'Please enter all fields',
      res,
    });
  }

  // Check for existing user
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return sendRestResponse({
      status: 400,
      message: 'User does not exist',
      res,
    });
  }

  if (user.status !== 'Active') {
    return sendRestResponse({
      status: 400,
      message: 'User is pending approval',
      res,
    });
  }

  if (!user.emailVerified) {
    res.redirect(`${process.env.CLIENT_URL}/login`);
    return;
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.lastFailedLogin = new Date();
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 3) {
      user.status = 'Locked';
      await user.save();
      return sendRestResponse({
        status: 400,
        message: 'User account locked',
        res,
      });
    }

    await user.save();
    return sendRestResponse({
      status: 400,
      message: 'Invalid credentials',
      res,
    });
  }

  // Reset failed login attempts
  user.failedLoginAttempts = 0;
  user.lastLogin = new Date();
  await user.save();

  const jwtToken = generateAuthToken({
    userId: user._id as string,
    role: user.role || 'User',
    status: user.status,
  });

  const existingOTP = await OTP.findOne({
    userId: user._id,
    otp: token,
  });

  if (!existingOTP) {
    return sendRestResponse({
      status: 404,
      message: 'OTP expired or invalid',
      res,
    });
  }

  // delete otp
  await OTP.findByIdAndDelete(existingOTP._id);

  const { password: userPassword, secret, ...loggedInUser } = user.toObject();

  return sendRestResponse({
    status: 200,
    message: 'User logged in',
    data: { token: jwtToken, user: loggedInUser },
    res,
  });
};

export function logout(req: Request, res: Response) {
  req.body.user = null;
  return sendRestResponse({
    status: 200,
    message: 'User logged out',
    res,
  });
}

export const whoAmI = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }

  const foundUser = await User.findById(user.userId).select(
    '-password -secret'
  );
  return sendRestResponse({
    status: 200,
    message: 'User found',
    data: foundUser,
    res,
  });
};
// Admin approval handler: 2fa otp
export const approveUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user || user.status !== 'Pending') {
    return sendRestResponse({
      status: 404,
      message: 'User not found or already approved',
      res,
    });
  }

  user.status = 'Active'; // Change status to active
  await user.save();

  // send user verification email
  await sendMail({
    to: user.email,
    subject: 'Account Approved',
    text: 'Your account has been approved',
    html: `
      <h1>Your account has been approved</h1>
      <p>Please click the following link to verify your email address</p>
      <a href="${process.env.SERVER_URL}/api/auth/verify-email/${user._id}">Verify Email</a>
      <br />
      <p>If you did not request this, please ignore this email</p>
    `,
  });

  return sendRestResponse({
    status: 200,
    message: 'User approved successfully',
    res,
  });
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendRestResponse({
      status: 400,
      message: 'Email is required',
      res,
    });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return sendRestResponse({
      status: 404,
      message: 'User not found',
      res,
    });
  }

  if (user.emailVerified) {
    return sendRestResponse({
      status: 400,
      message: 'Email already verified',
      res,
    });
  }

  // send email to user
  await sendMail({
    to: email,
    subject: 'Email Verification',
    text: 'Please click the link below to verify your email address',
    html: emailTemplates.verifyEmail(
      user.firstName,
      `${process.env.SERVER_URL}/api/auth/verify-email/${user._id}`
    ),
  });

  return sendRestResponse({
    status: 200,
    message: 'Verification email sent',
    res,
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const noUserUrl = createClientEmailVerificationURL({
        status: 'error',
        title: 'Email Verification Failed',
        description: 'The account no longer exists',
        suggestion: 'Please contact support for assistance',
      });
      res.redirect(noUserUrl);
      return;
    }

    if (user.emailVerified) {
      const verifiedUrl = createClientEmailVerificationURL({
        status: 'info',
        title: 'Email Verification Failed',
        description: 'Email already verified',
        suggestion: 'Please login to your account',
      });
      res.redirect(verifiedUrl);
      return;
    }

    user.emailVerified = true;
    await user.save();

    const successUrl = createClientEmailVerificationURL({
      status: 'success',
      title: 'Email Verified',
      description: 'Your email has been verified',
      suggestion: 'You can now login to your account',
    });
    res.redirect(successUrl);
    return;
  } catch (error) {
    logger.error('Error verifying email', error);
    const errorUrl = createClientEmailVerificationURL({
      status: 'error',
      title: 'Email Verification Failed',
      description: 'An error occurred while verifying your email',
      suggestion: 'Please try again or contact support',
    });

    res.redirect(errorUrl);
  }
};

/*
  ========================================
  USER MANAGEMENT CONTROLLERS
  ========================================
*/

// Get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -secret');
    return sendRestResponse({
      status: 200,
      message: 'Users found',
      data: users,
      res,
    });
  } catch (error) {
    logger.error('Error fetching users', error);
    return sendRestResponse({
      status: 500,
      message: 'Error fetching users',
      res,
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'User ID is required',
      res,
    });
  }

  try {
    const user = await User.findById(id).select('-password -secret');
    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }
    return sendRestResponse({
      status: 200,
      message: 'User found',
      data: user,
      res,
    });
  } catch (error) {
    logger.error('Error fetching user', error);
    return sendRestResponse({
      status: 500,
      message: 'Error fetching user',
      res,
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, role, status } = req.body;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'User ID is required',
      res,
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();
    return sendRestResponse({
      status: 200,
      message: 'User updated successfully',
      data: user,
      res,
    });
  } catch (error) {
    logger.error('Error updating user', error);
    return sendRestResponse({
      status: 500,
      message: 'Error updating user',
      res,
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    return sendRestResponse({
      status: 401,
      message: 'Unauthorized',
      res,
    });
  }
  const { id } = req.params;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'User ID is required',
      res,
    });
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }

    if (user.isSuper) {
      return sendRestResponse({
        status: 403,
        message: 'Cannot delete super admin',
        res,
      });
    }
    return sendRestResponse({
      status: 200,
      message: 'User deleted',
      res,
    });
  } catch (error) {
    logger.error('Error deleting user', error);
    return sendRestResponse({
      status: 500,
      message: 'Error deleting user',
      res,
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return sendRestResponse({
      status: 400,
      message: 'Email is required',
      res,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendRestResponse({
        status: 404,
        message: 'User not found',
        res,
      });
    }

    // send email to user
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: 'Please click the link below to reset your password',
      html: `
      <h1>Cronos⌚</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${process.env.SERVER_URL}/api/auth/reset-password/${user._id}">Reset Password</a>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return sendRestResponse({
      status: 200,
      message: 'Password reset link sent',
      res,
    });
  } catch (error) {
    logger.error('Error sending password reset email', error);
    return sendRestResponse({
      status: 500,
      message: 'Error sending password reset email',
      res,
    });
  }
};

// Update password
export const updatePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!id) {
    return sendRestResponse({
      status: 400,
      message: 'User ID is required',
      res,
    });
  }

  if (!password) {
    return sendRestResponse({
      status: 400,
      message: 'Password is required',
      res,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return sendRestResponse({
      status: 200,
      message: 'Password updated successfully',
      res,
    });
  } catch (error) {
    logger.error('Error updating password', error);
    return sendRestResponse({
      status: 500,
      message: 'Error updating password',
      res,
    });
  }
};

// create user
export const createUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, role, status } =
    req.body;

  if (!email || !password || !firstName || !lastName || !phone) {
    return sendRestResponse({
      status: 400,
      message: 'Please enter all fields',
      res,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
      status,
    });
    await user.save();

    return sendRestResponse({
      status: 201,
      message: 'User created',
      data: user,
      res,
    });
  } catch (error) {
    logger.error('Error creating user', error);
    return sendRestResponse({
      status: 500,
      message: 'Error creating user',
      res,
    });
  }
};