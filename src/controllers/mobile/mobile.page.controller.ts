import { NextFunction, Request, Response } from "express";
import { generateRedisKey } from "../../db/redis.db";
import { PageService } from "../../services/page.service";
import { successResponse } from "../../utils/responses";

export class PageController {
    private readonly pageService: PageService;
    private readonly pageRedis;
    constructor() {
        this.pageRedis = generateRedisKey("pages");
        this.pageService = new PageService()
    }
    async findByPage(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { slug } = req.params
            const page = await this.pageService.findOne({ where: { slug: slug } })
            return successResponse(res, page )
        } catch (error) {
            next(error)
        }
    }
    async home(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {

        } catch (error) {

        }
    }
    async about(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {

        } catch (error) {

        }
    }
    async contact(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {

        } catch (error) {

        }
    }
}