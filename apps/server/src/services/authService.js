import User from '../models/User.js';
import { generateAccessToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

export class AuthService {
  async register(userData) {
    const { username, email, password } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 400);
      }
      if (existingUser.username === username) {
        throw new AppError('Username already taken', 400);
      }
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = generateAccessToken(user._id.toString());

    logger.info(`User registered: ${user._id}`);

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token,
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateAccessToken(user._id.toString());

    logger.info(`User logged in: ${user._id}`);

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      token,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export default new AuthService();

