import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import UserService from "../services/user.service";
import { successResponse } from "../utils/responses";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { MinioModel, RoleModel } from "../models/sequelize.db";
import { Op, where } from "sequelize";
import bcrypt from "bcrypt";
import { RoleService } from "../services/role.service";
import { redisClient, generateRedisKey } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";
export class UserController implements BaseController {
  private readonly userService: UserService;
  private readonly usersRedis;
  constructor() {
    this.userService = new UserService();
    this.usersRedis = generateRedisKey("users")
  }

  async checkAuth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      return successResponse(res, {});
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      const catchUsers = await redisClient.get(this.usersRedis);
      let info;
      if (catchUsers) {
        const filtered = await JSON.parse(catchUsers).filter((item: any) =>
          query.some((word) =>
            item.firstname.toLowerCase().includes(word.toLowerCase()) ||
            item.lastname.toLowerCase().includes(word.toLowerCase()) ||
            item.username.toLowerCase().includes(word.toLowerCase()) ||
            item.phone.toLowerCase().includes(word.toLowerCase()) ||
            item.email.toLowerCase().includes(word.toLowerCase()) ||
            item.role.name.toLowerCase().includes(word.toLowerCase())
          )
        )
        const users = filtered.slice(
          (pages - 1) * limit,
          (pages - 1) * limit + limit
        );
        const totalPages = Math.ceil((filtered?.length || 1) / limit);
        info = {
          users,
          totalRecords: filtered?.length,
          totalPages: totalPages,
          currentPage: pages,
          allowNext: pages == totalPages ? false : true,
          allowPrevious: pages == 1 ? false : true,
          nextPage: pages == totalPages ? pages : pages + 1,
          previousPage: pages == 1 ? 1 : pages - 1,
        }
      } else {
        const usernameCondition = query.map((q) => ({
          username: { [Op.iLike]: `%${q}%` },
        }));
        const phoneCondition = query.map((q) => ({
          phone: { [Op.iLike]: `%${q}%` },
        }));
        const emailCondition = query.map((q) => ({
          email: { [Op.iLike]: `%${q}%` },
        }));
        const firstnameCondition = query.map((q) => ({
          firstname: { [Op.iLike]: `%${q}%` },
        }));
        const lastnameCondition = query.map((q) => ({
          lastname: { [Op.iLike]: `%${q}%` },
        }));
        const roleNameCondition = query.map((q) => ({
          "$role.name$": { [Op.iLike]: `%${q}%` },
        }));
        const conditions = [
          ...usernameCondition,
          ...phoneCondition,
          ...emailCondition,
          ...firstnameCondition,
          ...lastnameCondition,
          ...roleNameCondition,
        ];
        await this.userService
          .findAll({
            attributes: [
              "id",
              "firstname",
              "lastname",
              "username",
              "email",
              "phone",
              "status",
              "profile"
            ],
            include: [
              {
                model: RoleModel,
                as: "role",
                attributes: ["id", "name"],
              },
            ],
            where: { deletedAt: { [Op.is]: null }, [Op.or]: conditions },
            // offset: (pages - 1) * limit,
            // limit: limit,
            order: [["id", "DESC"]],
          })
          .then(async (response) => {
            await redisClient.set(this.usersRedis, JSON.stringify(response),{EX:RedisTTL});
            const users = response?.slice(
              (pages - 1) * limit,
              (pages - 1) * limit + limit
            );
            // const users = response;
            const totalPages = Math.ceil((response?.length || 1) / limit);
            info = {
              users,
              totalRecords: response?.length,
              totalPages: totalPages,
              currentPage: pages,
              allowNext: pages == totalPages ? false : true,
              allowPrevious: pages == 1 ? false : true,
              nextPage: pages == totalPages ? pages : pages + 1,
              previousPage: pages == 1 ? 1 : pages - 1,
            };
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return successResponse(res, info);
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = new CreateUserDTO(req.body);
      const { ...self } = await req.file;
      const file: any = await MinioModel.create({
        ...self,
      });
      const hashed = await bcrypt.hash(data.password as string, 12);
      data.password = hashed;
      data.profile = file.location;
      const user = await this.userService.create(data);
      delete user.password;
      delete user.deletedAt;
      await redisClient.del(this.usersRedis)
      return successResponse(res, { file, self: req.file });
    } catch (error) {
      next(error);
    }
  }
  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const { id } = req.params;
      if (!Number(id)) {
        return successResponse(res, null);
      }
      let user;
      const catchUsers = await redisClient.get(this.usersRedis);
      if (catchUsers) {
        const data = JSON.parse(catchUsers);
        user = await data.find((x:any) => x.id == id)
      } else {
        const filterOpts = {
          attributes: [
            "id",
            "firstname",
            "lastname",
            "username",
            "email",
            "phone",
            "status",
            "profile"
          ],
          include: [
            {
              model: RoleModel,
              as: "role",
              attributes: ["id", "name"],
            },
          ],
          where: { id: id, deletedAt: { [Op.is]: null } },
        };
        user = await this.userService.findOne(filterOpts);
      }
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!Number(id)) {
        return successResponse(res, null);
      }
      const data = new UpdateUserDTO(req.body);
      const filterOpts = {
        where: {
          id: id,
          deletedAt: { [Op.is]: null },
        },
      };
      const user = await this.userService.update(data, filterOpts);
      await redisClient.del(this.usersRedis)
      return successResponse(res, null, "Update user successful");
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!Number(id)) {
        return successResponse(res, null);
      }
      const user = await this.userService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      await redisClient.del(this.usersRedis)
      return successResponse(res, null, "Delete user successful");
    } catch (error) {
      next(error);
    }
  }
}
