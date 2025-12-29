import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserService {
  async getUsers(excludeUserId) {
    const users = await User.find({
      _id: { $ne: excludeUserId },
    })
      .select('-password')
      .sort({ username: 1 })
      .lean();

    return users;
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateOnlineStatus(userId, isOnline) {
    const update = { isOnline };
    
    if (!isOnline) {
      update.lastSeen = new Date();
    }

    await User.findByIdAndUpdate(userId, update);
  }
}

export default new UserService();

