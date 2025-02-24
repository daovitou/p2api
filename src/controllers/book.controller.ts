import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { BookService } from "../services/book.service";
import { errorResponse, successResponse } from "../utils/responses";
import { Op } from "sequelize";
import { BookCategoryModel, BookModel, LanguageModel, MinioModel } from "../models/sequelize.db";
import { IBook } from "../interfaces/book.interface";
import { CreateBookDTO, UpdateBookDTO } from "../dtos/book.dto";
import { generateRedisKey, redisClient } from "../db/redis.db";
import { RedisTTL } from "../utils/helpers";

export class BookController implements BaseController {
    private readonly bookService: BookService;
    private readonly bookRedis;
    constructor() {
        this.bookService = new BookService();
        this.bookRedis = generateRedisKey("books");
    }
    async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const cat = Number(req.query.cat) || 0;
            const pages = Number(req.query.pages) || 1;
            const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
            const search = req.query.search?.toString() || ("" as string);
            const query = typeof search === "string" ? search.split(" ") : [];
            let info;
            const catchBooks = await redisClient.get(this.bookRedis)
            if (catchBooks) {
                const filtered = await JSON.parse(catchBooks).filter((item: any) =>
                    query.some((word) => {
                        if (cat > 0) {
                            return (
                                (item.code.toLowerCase().includes(word.toLowerCase()) ||
                                    item.title.toLowerCase().includes(word.toLowerCase()) ||
                                    item.author.toLowerCase().includes(word.toLowerCase()) ||
                                    item.isbn.toLowerCase().includes(word.toLowerCase()) ||
                                    item.issn.toLowerCase().includes(word.toLowerCase()) ||
                                    item.bookCategory.name.toLowerCase().includes(word.toLowerCase()) ||
                                    item.language.name.toLowerCase().includes(word.toLowerCase())) &&
                                item.bookCategoryId == cat
                            )
                        } else {
                            return (
                                item.code.toLowerCase().includes(word.toLowerCase()) ||
                                item.title.toLowerCase().includes(word.toLowerCase()) ||
                                item.author.toLowerCase().includes(word.toLowerCase()) ||
                                item.isbn.toLowerCase().includes(word.toLowerCase()) ||
                                item.issn.toLowerCase().includes(word.toLowerCase()) ||
                                item.bookCategory.name.toLowerCase().includes(word.toLowerCase()) ||
                                item.language.name.toLowerCase().includes(word.toLowerCase())
                            )
                        }
                    }

                    )
                )
                const books = filtered.slice(
                    (pages - 1) * limit,
                    (pages - 1) * limit + limit
                );
                const totalPages = Math.ceil((filtered?.length || 1) / limit);
                info = {
                    books,
                    totalRecords: filtered?.length,
                    totalPages: totalPages,
                    currentPage: pages,
                    allowNext: pages == totalPages ? false : true,
                    allowPrevious: pages == 1 ? false : true,
                    nextPage: pages == totalPages ? pages : pages + 1,
                    previousPage: pages == 1 ? 1 : pages - 1,
                }
            } else {
                const codeConditions = query.map((q) => ({
                    code: { [Op.iLike]: `%${q}%` },
                }));
                const titleConditions = query.map((q) => ({
                    title: { [Op.iLike]: `%${q}%` },
                }));
                const authorConditions = query.map((q) => ({
                    author: { [Op.iLike]: `%${q}%` },
                }));
                const isbnConditions = query.map((q) => ({
                    isbn: { [Op.iLike]: `%${q}%` },
                }));
                const issbConditions = query.map((q) => ({
                    issn: { [Op.iLike]: `%${q}%` },
                }));
                const categoryContiction = query.map((q) => ({
                    "$bookCategory.name$": { [Op.iLike]: `%${q}%` },
                }));
                const languageCondition = query.map((q) => ({
                    "$language.name$": { [Op.iLike]: `%${q}%` },
                }));
                const conditions = [
                    ...codeConditions,
                    ...titleConditions,
                    ...authorConditions,
                    ...isbnConditions,
                    ...issbConditions,
                    ...categoryContiction,
                    ...languageCondition
                ]
                await this.bookService
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
                                model: BookCategoryModel,
                                as: "bookCategory",
                                attributes: ["id", "name"],
                            },
                        ],

                        order: [["id", "DESC"]],
                    })
                    .then(async (response) => {
                        await redisClient.set(this.bookRedis, JSON.stringify(response), { EX: RedisTTL })
                        const books = response?.slice(
                            (pages - 1) * limit,
                            (pages - 1) * limit + limit
                        );
                        // const videos = response;
                        const totalPages = Math.ceil((response?.length || 1) / limit);

                        info = {
                            books,
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
            const data = new CreateBookDTO(req.body) as IBook;
            const { files } = await req;
            interface FileWithKey extends Express.Multer.File {
                key: string;
                location: string;
            }
            if ((files as unknown as { [fieldname: string]: FileWithKey[] })) {
                const ebook = await (files as unknown as { [fieldname: string]: FileWithKey[] })["ebook"];
                await MinioModel.create({ ...ebook[0] })
                data.ebook = ebook[0].location;
                const image = await (files as unknown as { [fieldname: string]: FileWithKey[] })["image"];
                await MinioModel.create({ ...image[0] })
                data.image = image[0].location;
            }
            await this.bookService.create(data)
            await redisClient.del(this.bookRedis)
            return successResponse(res, null, "Create book successful!");
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
            let book;
            const catchBooks = await redisClient.get(this.bookRedis)
            if (catchBooks) {
                book = await JSON.parse(catchBooks).find((x: any) => x.id == id)
            } else {
                book = await this.bookService.findById(Number(id), {
                    include: [
                        {
                            model: LanguageModel,
                            as: "language",
                            attributes: ["id", "name"],
                        },
                        {
                            model: BookCategoryModel,
                            as: "bookCategory",
                            attributes: ["id", "name"],
                        },
                    ],
                });
            }
            if (!book) {
                return errorResponse(res, 404, "No record found!");
            }
            // await BookModel.increment('viewer', { by: 1, where: { id: id } })
            return successResponse(res, book);
        } catch (error) {
            next(error);
        }
    }
    async update(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { id } = req.params;
            const data = new UpdateBookDTO(req.body);
            //   if (!data || data.title?.trim() == null) {
            //     return errorResponse(res, 404, {
            //       field: "name",
            //       message: "Video category name is required!",
            //     });
            //   }

            if (!Number(id)) {
                return errorResponse(res, 404, "No record found");
            }
            const { files } = await req;
            interface FileWithKey extends Express.Multer.File {
                key: string;
                location: string
            }
            if ((files as unknown as { [fieldname: string]: FileWithKey[] })["ebook"]) {
                const ebook = await (files as unknown as { [fieldname: string]: FileWithKey[] })["ebook"];
                await MinioModel.create({ ...ebook[0] })
                data.ebook = ebook[0].location;
            }
            if ((files as unknown as { [fieldname: string]: FileWithKey[] })["image"]) {
                const image = await (files as unknown as { [fieldname: string]: FileWithKey[] })["image"];
                await MinioModel.create({ ...image[0] })
                data.image = image[0].location;
            }
            await this.bookService.update(data, { where: { id: id } });
            await redisClient.del(this.bookRedis)
            return successResponse(res, null, "Update book successful!");
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
            await this.bookService.update(
                { deletedAt: new Date() },
                { where: { id: id, deletedAt: { [Op.is]: null } } }
            );
            await redisClient.del(this.bookRedis)
            return successResponse(res, {}, "Delete book successful.");
        } catch (error) {
            next(error);
        }
    }
    async findBookByCode(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { code } = req.params
            const book = await this.bookService.findOne({ where: { code } })
            return successResponse(res, book)
        } catch (error) {
            next(error)
        }
    }
}
