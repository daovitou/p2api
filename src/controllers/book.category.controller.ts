import { NextFunction, Request, response, Response } from "express";
import { BookCategoryService } from "../services/book.category.service";
import { BaseController } from "./base.controller";
import { errorResponse, successResponse } from "../utils/responses";
import {
  CreateBookCategoryDTO,
  UpdateBookCategoryDTO,
} from "../dtos/book.category.dto";
import { IBookCategory } from "../interfaces/book.category.interface";
import { Op, Sequelize, where } from "sequelize";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { BookService } from "../services/book.service";
import { BookCategoryModel, BookModel } from "../models/sequelize.db";
import { includes } from "lodash";
import { sequelize } from "../db/sequelize.db";
import { count } from "console";
import { any } from "zod";
import { RedisTTL, roles } from "../utils/helpers";

export class BookCategoryController implements BaseController {
  private readonly bookCategoryService: BookCategoryService;
  private readonly bookService: BookService
  private readonly bookCategoryRedis;
  constructor() {
    this.bookCategoryService = new BookCategoryService();
    this.bookService = new BookService()
    this.bookCategoryRedis = generateRedisKey("book.categories");
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      let info;
      const catchBookCategory = await redisClient.get(this.bookCategoryRedis)
      if (catchBookCategory) {
        const filtered = await JSON.parse(catchBookCategory).filter((item: any) =>
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
        // await sequelize.query(`
        //     SELECT
        //       "bookCategories"."id",
        //       "bookCategories"."name",
        //       COUNT("books"."id") as "itemCount"
        //     FROM
        //       books
        //       RIGHT JOIN
        //       "bookCategories"
        //       ON 
        //         books."bookCategoryId" = "bookCategories"."id"
        //     WHERE "bookCategories"."deletedAt" ISNULL AND "books"."deletedAt" ISNULL
        //     GROUP BY "bookCategories"."id","bookCategories"."name"
        //     ORDER BY "bookCategories"."name"
        //   `).then(res => books = res[0])
        await this.bookCategoryService
          .findAll({
            where: {
              deletedAt: { [Op.is]: null },
              [Op.and]: conditions
            },
            attributes: [
              "id",
              "name",
              "createdAt",
              "updatedAt",
              [Sequelize.fn("COUNT", Sequelize.col("books.id")), "itemCount"]
            ],
            include: [
              {
                model: BookModel,
                where: { deletedAt: { [Op.is]: null } },
                attributes: [],
                include: [],
                required: false  // Equivalent to RIGHT JOIN behavior
              }
            ],
            group: ["bookCategories.id", "bookCategories.name", "bookCategories.createdAt", "bookCategories.updatedAt"],
            order: [["name", "ASC"]],
          })
          .then(async (response) => {
            // const categories = response;
            await redisClient.set(this.bookCategoryRedis, JSON.stringify(response), { EX: RedisTTL });
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
      // const conditions = query.map((q) => ({
      //   name: { [Op.iLike]: `%${q}%` },
      // }));
      // await this.bookCategoryService
      //   .findAll({
      //     where: { deletedAt: { [Op.is]: null }, [Op.and]: conditions },
      //     attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt'] },
      //     order: [["name", "ASC"]],
      //     // offset: (pages - 1) * limit,
      //     // limit: limit,
      //   })
      //   .then(async (response) => {
      //     // const categories = response;
      //     // await redisClient.set(this.bookCategoryRedis, JSON.stringify(response), { EX: 180 });
      //     const categories = response?.slice(
      //       (pages - 1) * limit,
      //       (pages - 1) * limit + limit
      //     );
      //     const totalPages = Math.ceil((response?.length || 1) / limit);
      //     info = {
      //       categories,
      //       totalRecords: response?.length,
      //       totalPages: totalPages,
      //       currentPage: pages,
      //       allowNext: pages == totalPages ? false : true,
      //       allowPrevious: pages == 1 ? false : true,
      //       nextPage: pages == totalPages ? pages : pages + 1,
      //       previousPage: pages == 1 ? 1 : pages - 1,
      //     };
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
      return successResponse(res, info);
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = new CreateBookCategoryDTO(req.body) as IBookCategory;
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Book category name is required!",
        });
      }
      const existing = await this.bookCategoryService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Book category already existing",
        });
      }
      await this.bookCategoryService.create(data);
      await redisClient.del(this.bookCategoryRedis)
      return successResponse(res, null, "Create book category successful!");
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
      const catchBookCategory = await redisClient.get(this.bookCategoryRedis)
      if (catchBookCategory) {
        category = await JSON.parse(catchBookCategory).find((x: any) => x.id == id)
      } else {
        category = await this.bookCategoryService.findById(Number(id));
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
      const data = new UpdateBookCategoryDTO(req.body);
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 404, {
          field: "name",
          message: "Book category name is required!",
        });
      }
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      const existing = await this.bookCategoryService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Book category already existing",
        });
      }
      await this.bookCategoryService.update(data, { where: { id: id } });
      await redisClient.del(this.bookCategoryRedis)
      return successResponse(res, null, "Update book category successful!");
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
      // await this.bookCategoryService.delete({ where: { id: id } });
      await this.bookCategoryService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      await redisClient.del(this.bookCategoryRedis)
      return successResponse(res, null, "Delete book category successful.");
    } catch (error) {
      next(error);
    }
  }
  async findBooksByCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params
    } catch (error) {
      next(error)
    }
  }
}
