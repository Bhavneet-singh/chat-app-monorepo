import userService from '../services/userService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class UserController {
  getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsers(req.user._id.toString());

    res.json({
      success: true,
      data: {
        users,
      },
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.json({
      success: true,
      data: {
        user,
      },
    });
  });
}

export default new UserController();

