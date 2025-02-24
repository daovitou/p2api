import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { LanguageService } from "../services/language.service";
import { Op } from "sequelize";
import { errorResponse, successResponse } from "../utils/responses";
import { CreateLanguageDTO, UpdateLanguageDTO } from "../dtos/language.dto";
import { ILanguage } from "../interfaces/language.interface";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";

export class LanguageController implements BaseController {
  private readonly languageService: LanguageService;
  private readonly languageRedis;
  constructor() {
    this.languageService = new LanguageService();
    this.languageRedis = generateRedisKey("languages")
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      let info;

      const catchLanguage = await redisClient.get(this.languageRedis)
      if (catchLanguage) {
        const filtered = await JSON.parse(catchLanguage).filter((item: any) =>
          query.some((word) =>
            item.name.toLowerCase().includes(word.toLowerCase())
          )
        )
        const languages = filtered.slice(
          (pages - 1) * limit,
          (pages - 1) * limit + limit
        );
        const totalPages = Math.ceil((filtered?.length || 1) / limit);
        info = {
          languages,
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
        await this.languageService
          .findAll({
            where: { deletedAt: { [Op.is]: null }, [Op.and]: conditions },
            attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
            order: [["name", "ASC"]],
          })
          .then(async (response) => {
            await redisClient.set(this.languageRedis, JSON.stringify(response),{EX:RedisTTL})
            const languages = response?.slice(
              (pages - 1) * limit,
              (pages - 1) * limit + limit
            );
            // const languages = response;
            const totalPages = Math.ceil((response?.length || 1) / limit);

            info = {
              languages,
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
      const data = new CreateLanguageDTO(req.body) as ILanguage;
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Language name is required!",
        });
      }
      const existing = await this.languageService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Language already existing",
        });
      }
      await this.languageService.create(data);
      await redisClient.del(this.languageRedis)
      return successResponse(res, null, "Create language successful!");
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
      let language;
      const catchLanguage = await redisClient.get(this.languageRedis)
      if (catchLanguage) {
        language = await JSON.parse(catchLanguage).find((x: any) => x.id == id)
      } else {

        language = await this.languageService.findById(Number(id));
      }
      if (!language) {
        return errorResponse(res, 404, "No record found!");
      }
      return successResponse(res, language);
    } catch (error) {
      next(error);
    }
  }
  async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      const data = new UpdateLanguageDTO(req.body);
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 404, {
          field: "name",
          message: "Language name is required!",
        });
      }
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      const existing = await this.languageService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Language already existing",
        });
      }
      await this.languageService.update(data, { where: { id: id } });
      await redisClient.del(this.languageRedis)
      return successResponse(res, null, "Update language successful!");
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
      // await this.languageService.delete({ where: { id: id } });
      await this.languageService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      await redisClient.del(this.languageRedis)
      return successResponse(res, {}, "Delete language successful.");
    } catch (error) {
      next(error);
    }
  }
}
