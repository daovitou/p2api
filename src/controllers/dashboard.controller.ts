import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/responses";
import UserService from "../services/user.service";
import { BookService } from "../services/book.service";
import { VideoService } from "../services/video.service";
import { BookCategoryService } from "../services/book.category.service";
import { VideoCategoryService } from "../services/video.category.service";
import { sequelize } from "../db/sequelize.db";

export class DashboardController {
    private readonly userService: UserService
    private readonly bookService: BookService
    private readonly videoService: VideoService
    private readonly bookCategoryService: BookCategoryService
    private readonly videoCategoryService: VideoCategoryService
    constructor() {
        this.userService = new UserService()
        this.bookService = new BookService()
        this.videoService = new VideoService()
        this.bookCategoryService = new BookCategoryService()
        this.videoCategoryService = new VideoCategoryService()
    }
    async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {

            const books = await sequelize.query(`SELECT books.code,
                                                    books.title,
                                                    books.issued,
                                                    books.page,
                                                    books.isbn,
                                                    books.issn,
                                                    books.image,
                                                    books.viewer,
                                                    languages.name AS language,
                                                    "bookCategories".name AS category,
                                                    books.ebook
                                                FROM books
                                                    JOIN "bookCategories" ON books."bookCategoryId" = "bookCategories".id
                                                    JOIN languages ON books."languageId" = languages.id
                                                WHERE books."deletedAt" IS NULL`);
            const videos = await sequelize.query(`SELECT
                                                    videos.title, 
                                                    videos."youtubeId", 
                                                    videos.published, 
                                                    videos.author, 
                                                    languages."name", 
                                                    "videoCategories"."name"
                                                FROM
                                                    videos
                                                    INNER JOIN
                                                    "videoCategories"
                                                    ON 
                                                        videos."videoCategoryId" = "videoCategories"."id"
                                                    INNER JOIN
                                                    languages
                                                    ON 
                                                        videos."languageId" = languages."id"
                                                WHERE videos."deletedAt" ISNULL`);
            const bookCategories = await sequelize.query(`SELECT
                                                            "bookCategories"."name", 
                                                            "bookCategories"."id"
                                                        FROM
                                                            "bookCategories"
                                                            WHERE "bookCategories"."deletedAt" ISNULL`);
            const videoCategories = await sequelize.query(`SELECT
                                                            "videoCategories"."id", 
                                                            "videoCategories"."name"
                                                        FROM
                                                            "videoCategories"
                                                        WHERE "videoCategories"."deletedAt" ISNULL`);
            const users = await sequelize.query(`SELECT
                                                    users."id", 
                                                    users.firstname, 
                                                    users.lastname, 
                                                    users.username, 
                                                    users.email, 
                                                    users."password", 
                                                    users.phone, 
                                                    users.status, 
                                                    roles."name" as role, 
                                                    users.profile
                                                FROM
                                                    users
                                                    INNER JOIN
                                                    roles
                                                    ON 
                                                        users."roleId" = roles."id"
                                                WHERE users."deletedAt" ISNULL`);
            const languages = await sequelize.query(`SELECT
                                                        languages."id", 
                                                        languages."name"
                                                    FROM
                                                        languages
                                                    WHERE languages."deletedAt" ISNULL`)
            const data = {
                totalBooks: books[0].length,
                totalVideos: books[0].length,
                totalUsers: users[0].length,
                totalLanguages: languages[0].length,
                totalBookCategories: bookCategories[0].length,
                totalVideoCategories: videoCategories[0].length
            }
            return successResponse(res, data)
        } catch (error) {
            next(error)
        }
    }
}