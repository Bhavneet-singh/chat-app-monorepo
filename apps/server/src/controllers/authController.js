import authService from '../services/authService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class AuthController {
  register = asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  });

  login = asyncHandler(async (req, res) => {
    const { user, token } = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id.toString());

    res.json({
      success: true,
      data: {
        user,
      },
    });
  });
}

export default new AuthController();

