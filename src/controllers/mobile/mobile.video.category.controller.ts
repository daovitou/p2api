import { NextFunction, Request, Response } from "express";
import { VideoCategoryService } from "../../services/video.category.service";
import { successResponse } from "../../utils/responses";
import { Op } from "sequelize";
import { generateRedisKey, redisClient } from "../../db/redis.db";

export class MobileVideoCategoryController {
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
            attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
            // offset: (pages - 1) * limit,
            // limit: limit,
            order: [["name", "ASC"]],
          })
          .then(async (response) => {
            await redisClient.set(this.videoCategoryRedis, JSON.stringify(response))
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
}