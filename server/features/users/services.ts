import User from './models';
import logger from '../../utils/logger';
import mongoose from 'mongoose';
export async function getSystemAdminUserId() {
  const systemAdmin = await User.findOne({
    email: process.env.SERVER_ADMIN_EMAIL,
  });

  if (!systemAdmin) {
    logger.error('System Admin User not found');
    throw new Error('System Admin User not found');
  }
  return systemAdmin._id as mongoose.Types.ObjectId;
}
