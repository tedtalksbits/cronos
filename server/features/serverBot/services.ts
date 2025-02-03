import logger from '../../utils/logger';
import User from '../users/models';
import mongoose from 'mongoose';
export async function getSystemUserId() {
  const systemUser = await User.findOne({
    email: process.env.SERVER_BOT_EMAIL,
  });
  if (!systemUser) {
    logger.error(
      'System user not found. With the email:' +
        process.env.SERVER_BOT_EMAIL +
        '. Create the system user first.'
    );
    throw new Error(
      'System user not found. Make sure to run createSystemUser.ts script.'
    );
  }
  return systemUser._id as mongoose.Types.ObjectId;
}
