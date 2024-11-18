// users/routes.ts
import express from 'express';
import {
  approveUser,
  createUser,
  deleteUser,
  generateOTP,
  getUserById,
  getUsers,
  login,
  logout,
  register,
  sendVerificationEmail,
  updateUser,
  verifyEmail,
  verifyOTP,
  whoAmI,
} from './controllers';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.get('/approve/:userId', approveUser);
router.get('/whoami', authenticate, whoAmI);
router.get('/logout', logout);
router.get('/verify-email/:userId', verifyEmail);
// user management routes
router.post('/verify-email', authenticate, authorize, sendVerificationEmail);
router.post('/users', authenticate, authorize, createUser);
router.get('/users', authenticate, authorize, getUsers);
router.get('/users/:id', authenticate, authorize, getUserById);
router.put('/users/:id', authenticate, authorize, updateUser);
router.delete('/users/:id', authenticate, authorize, deleteUser);
// otp
router.post('/otp', generateOTP);
router.post('/otp/verify', verifyOTP);
export default router;
