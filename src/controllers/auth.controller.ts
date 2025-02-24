import { NextFunction, Request, Response } from "express";
import UserService from "../services/user.service";
import { LogginDTO } from "../dtos/user.dto";
import { errorResponse, successResponse } from "../utils/responses";
import bcyrpt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { RoleModel } from "../models/sequelize.db";
export class AuthController {
  private readonly userService: UserService;
  constructor() {
    this.userService = new UserService();
  }
  async loggin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = new LogginDTO(req.body);
      if (!data.username || !data.password) {
        return errorResponse(res, 400, "Invalid username or password");
      }
      const filterOpts = {
        attributes: [
          "id",
          "firstname",
          "lastname",
          "username",
          "email",
          "phone",
          "status",
          "password",
          "profile"
        ],
        include: [
          {
            model: RoleModel,
            as: "role",
            attributes: ["name"],
          },
        ],
      };
      const user = await this.userService.findByUsername(
        data.username,
        filterOpts
      );
      if (!user) {
        return errorResponse(res, 400, "Invalid username or password");
      }
      if (user.deletedAt != null) {
        return errorResponse(res, 400, "Invalid username or password");
      }
      const isMatch =
        data.password && user.password
          ? bcyrpt.compareSync(data.password, user.password)
          : false;
      if (!isMatch) {
        return errorResponse(res, 400, "Invalid username or password");
      }
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role:user.role?.name
      };
      const accessToken = await jwt.sign(
        payload,
        process.env.APP_SECRET as string,
        {
          expiresIn: "90d",
        }
      );
      const refreshToken = await jwt.sign(
        payload,
        process.env.APP_SECRET as string,
        {
          expiresIn: "180d",
        }
      );
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await this.userService.update(user, { where: { id: user.id } });
      // res.cookie("Authorization",`Bearer ${user.accessToken}`)
      return successResponse(res, {
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role?.name,
          profile: user.profile
        },
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
}
