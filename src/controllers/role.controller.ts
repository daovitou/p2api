import { NextFunction, Request, Response } from "express";
import { RoleService } from "../services/role.service";
import { successResponse } from "../utils/responses";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";

export class RoleController {
  private readonly roleService: RoleService;
  private readonly roleRedis
  constructor() {
    this.roleService = new RoleService();
    this.roleRedis = generateRedisKey("roles")
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const catchRole = await redisClient.get(this.roleRedis)
      let roles;
      if (catchRole) {
        roles = await JSON.parse(catchRole)
      } else {
        await this.roleService.findAll({
          attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
          order: [["id", "ASC"]],
        }).then(async (res) => {
          await redisClient.set(this.roleRedis, JSON.stringify(res), { EX: RedisTTL })
          roles = res
        });
      }
      return successResponse(res, roles);
    } catch (error) {
      next(error);
    }
  }
}
