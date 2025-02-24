import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../utils/responses";
import { BookCategoryService } from "../../services/book.category.service";
import { Op, where } from "sequelize";
import { generateRedisKey, redisClient } from "../../db/redis.db";

export class MobileBookCategoryController {
    private readonly bookCategoryService: BookCategoryService;
    private readonly bookCategoryRedis;
    constructor() {
        this.bookCategoryService = new BookCategoryService();
        this.bookCategoryRedis = generateRedisKey("book.categories");
    }
    async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const pages = Number(req.query.pages) || 1;
            const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
            const search = req.query.search?.toString() || ("" as string);
            const query = typeof search === "string" ? search.split(" ") : [];
            let info;
            const catchBookCategory = await redisClient.get(this.bookCategoryRedis);
            if (catchBookCategory) {
                const filtered = await JSON.parse(catchBookCategory).filter(
                    (item: any) =>
                        query.some((word) =>
                            item.name.toLowerCase().includes(word.toLowerCase())
                        )
                );
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
                };
            } else {
                const conditions = query.map((q) => ({
                    name: { [Op.iLike]: `%${q}%` },
                }));
                await this.bookCategoryService
                    .findAll({
                        where: { deletedAt: { [Op.is]: null }, [Op.and]: conditions },
                        attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] },
                        order: [["name", "ASC"]],
                        // offset: (pages - 1) * limit,
                        // limit: limit,
                    })
                    .then(async (response) => {
                        // const categories = response;
                        await redisClient.set(
                            this.bookCategoryRedis,
                            JSON.stringify(response)
                        );
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
