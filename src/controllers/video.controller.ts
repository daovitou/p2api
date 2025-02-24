import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { VideoService } from "../services/video.service";
import { errorResponse, successResponse } from "../utils/responses";
import { Op } from "sequelize";
import { IVideo } from "../interfaces/video.category";
import { CreateVideoDTO, UpdateVideoDTO } from "../dtos/video.dto";
import { LanguageModel, VideoCatogoryModel, VideoModel } from "../models/sequelize.db";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";

export class VideoController implements BaseController {
  private readonly videoService: VideoService;
  private readonly videoRedis
  constructor() {
    this.videoService = new VideoService();
    this.videoRedis = generateRedisKey("videos")
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const cat = Number(req.query.cat) || 0;
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      let info;
      const catchVideo = await redisClient.get(this.videoRedis)
      if (catchVideo) {
        const filtered = await JSON.parse(catchVideo).filter((item: any) =>
          query.some((word) => {
            if (cat > 0) {
              return (
                (item.title.toLowerCase().includes(word.toLowerCase()) ||
                  item.author.toLowerCase().includes(word.toLowerCase()) ||
                  item.videoCategory.name.toLowerCase().includes(word.toLowerCase()) ||
                  item.language.name.toLowerCase().includes(word.toLowerCase())) &&
                item.videoCategoryId == cat
              )
            } else {
              return (item.title.toLowerCase().includes(word.toLowerCase()) ||
                item.author.toLowerCase().includes(word.toLowerCase()) ||
                item.videoCategory.name.toLowerCase().includes(word.toLowerCase()) ||
                item.language.name.toLowerCase().includes(word.toLowerCase()))
            }
          }
          )
        )
        const videos = filtered.slice(
          (pages - 1) * limit,
          (pages - 1) * limit + limit
        );
        const totalPages = Math.ceil((filtered?.length || 1) / limit);
        info = {
          videos,
          totalRecords: filtered?.length,
          totalPages: totalPages,
          currentPage: pages,
          allowNext: pages == totalPages ? false : true,
          allowPrevious: pages == 1 ? false : true,
          nextPage: pages == totalPages ? pages : pages + 1,
          previousPage: pages == 1 ? 1 : pages - 1,
        }
      } else {
        const titleConditions = query.map((q) => ({
          title: { [Op.iLike]: `%${q}%` },
        }));
        const authorConditions = query.map((q) => ({
          author: { [Op.iLike]: `%${q}%` },
        }));
        const categoryContiction = query.map((q) => ({
          "$videoCategory.name$": { [Op.iLike]: `%${q}%` },
        }));
        const languageCondition = query.map((q) => ({
          "$language.name$": { [Op.iLike]: `%${q}%` },
        }));
        const conditions = [
          ...titleConditions,
          ...authorConditions,
          ...categoryContiction,
          ...languageCondition
        ]
        await this.videoService
          .findAll({
            where: { deletedAt: { [Op.is]: null }, [Op.or]: conditions },
            attributes: { exclude: ['deletedAt'] },
            include: [
              {
                model: LanguageModel,
                as: "language",
                attributes: ["id", "name"],
              },
              {
                model: VideoCatogoryModel,
                as: "videoCategory",
                attributes: ["id", "name"],
              },
            ],
            // offset: (pages - 1) * limit,
            // limit: limit,
            order: [["id", "DESC"]],
          })
          .then(async (response) => {
            await redisClient.set(this.videoRedis, JSON.stringify(response), { EX: RedisTTL })
            const videos = response?.slice(
              (pages - 1) * limit,
              (pages - 1) * limit + limit
            );
            // const videos = response;
            const totalPages = Math.ceil((response?.length || 1) / limit);

            info = {
              videos,
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
      const data = new CreateVideoDTO(req.body) as IVideo;
      if (!data || data.title?.trim() == null) {
        return errorResponse(res, 400, {
          field: "title",
          message: "video title is required!",
        });
      }
      await this.videoService.create(data);
      await redisClient.del(this.videoRedis)
      return successResponse(res, null, "Create video successful!");
    } catch (error) {
      next(error);
    }
  }
  async findById(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found!");
      }
      let video
      const catchVideos = await redisClient.get(this.videoRedis)
      if (catchVideos) {
        video = await JSON.parse(catchVideos).find((x: any) => x.id == id)
      } else {
        video = await this.videoService.findById(Number(id), {
          include: [
            {
              model: LanguageModel,
              as: "language",
              attributes: ["id", "name"],
            },
            {
              model: VideoCatogoryModel,
              as: "videoCategory",
              attributes: ["id", "name"],
            },
          ],
        });
      }
      if (!video) {
        return errorResponse(res, 404, "No record found!");
      }
      // await VideoModel.increment('viewer', { by: 1, where: { id: id } })
      return successResponse(res, video);
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const data = new UpdateVideoDTO(req.body);
      if (!data || data.title?.trim() == null) {
        return errorResponse(res, 404, {
          field: "name",
          message: "Video category name is required!",
        });
      }
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      await this.videoService.update(data, { where: { id: id } });
      await redisClient.del(this.videoRedis)
      return successResponse(res, null, "Update video successful!");
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
      await this.videoService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      await redisClient.del(this.videoRedis)
      return successResponse(res, {}, "Delete viceo category successful.");
    } catch (error) {
      next(error);
    }
  }
}
