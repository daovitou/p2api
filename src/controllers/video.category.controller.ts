import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoCategoryService } from "../services/video.category.service";
import { Op, Sequelize } from "sequelize";
import { errorResponse, successResponse } from "../utils/responses";
import {
  CreateVideoCategoryDTO,
  UpdateVideoCategoryDTO,
} from "../dtos/video.category.dto";
import { IVideoCategory } from "../interfaces/video.category.interface";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";
import { VideoModel } from "../models/sequelize.db";

export class VideoCategoryController implements BaseController {
  private readonly videoCategoryService: VideoCategoryService;
  private readonly videoCategoryRedis;
  constructor() {
    this.videoCategoryService = new VideoCategoryService();
    this.videoCategoryRedis = generateRedisKey("video.categories");
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      let info;
      const catchVideoCategories = await redisClient.get(this.videoCategoryRedis)
      if (catchVideoCategories) {
        const filtered = await JSON.parse(catchVideoCategories).filter((item: any) =>
          query.some((word) =>
            item.name.toLowerCase().includes(word.toLowerCase())
          )
        )
        const categories = filtered.slice(
          (pages - 1) * limit,
          (pages - 1) * limit + limit
        );
        const totalPages = Math.ceil((filtered?.length || 1) / limit);
        info = {
          categories,
          totalRecords: filtered?.length,
          totalPages: totalPages,
          currentPage: pages,
          allowNext: pages == totalPages ? false : true,
          allowPrevious: pages == 1 ? false : true,
          nextPage: pages == totalPages ? pages : pages + 1,
          previousPage: pages == 1 ? 1 : pages - 1,
        }
      } else {
        const conditions = query.map((q) => ({
          name: { [Op.iLike]: `%${q}%` },
        }));
        await this.videoCategoryService
          .findAll({
            where: { deletedAt: { [Op.is]: null }, [Op.and]: conditions },
            attributes: [
              "id",
              "name",
              "createdAt",
              "updatedAt",
              [Sequelize.fn("COUNT", Sequelize.col("videos.id")), "itemCount"]
            ],
            include: [
              {
                model: VideoModel,
                where: { deletedAt: { [Op.is]: null } },
                attributes: [],
                include: [],
                required: false  // Equivalent to RIGHT JOIN behavior
              }
            ],
            group: ["videoCategories.id", "videoCategories.name", "videoCategories.createdAt", "videoCategories.updatedAt"],
            order: [["name", "ASC"]],
          })
          .then(async (response) => {
            await redisClient.set(this.videoCategoryRedis, JSON.stringify(response), { EX: RedisTTL })
            const categories = response?.slice(
              (pages - 1) * limit,
              (pages - 1) * limit + limit
            );
            const totalPages = Math.ceil((response?.length || 1) / limit);
            info = {
              categories,
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
            console.log(error);
          });
      }
      return successResponse(res, info);
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = new CreateVideoCategoryDTO(req.body) as IVideoCategory;
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 400, {
          field: "name",
          message: "video category name is required!",
        });
      }
      const existing = await this.videoCategoryService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Video category already existing",
        });
      }
      await this.videoCategoryService.create(data);
      await redisClient.del(this.videoCategoryRedis)
      return successResponse(res, null, "Create video category successful!");
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
        return errorResponse(res, 404, "No record found!");
      }
      let category;
      const catchVideoCategories = await redisClient.get(this.videoCategoryRedis)
      if (catchVideoCategories) {
        category = await JSON.parse(catchVideoCategories).find((x: any) => x.id == id)
      } else {
        category = await this.videoCategoryService.findById(Number(id));
      }
      if (!category) {
        return errorResponse(res, 404, "No record found!");
      }
      return successResponse(res, category);
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const data = new UpdateVideoCategoryDTO(req.body);
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 404, {
          field: "name",
          message: "Video category name is required!",
        });
      }
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      const existing = await this.videoCategoryService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Video category already existing",
        });
      }
      await this.videoCategoryService.update(data, { where: { id: id } });
      await redisClient.del(this.videoCategoryRedis)
      return successResponse(res, null, "Update video category successful!");
    } catch (error) {
      next(error);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;

      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      // await this.videoCategoryService.delete({ where: { id: id } });
      await this.videoCategoryService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      await redisClient.del(this.videoCategoryRedis)
      return successResponse(res, {}, "Delete viceo category successful.");
    } catch (error) {
      next(error);
    }
  }
}
