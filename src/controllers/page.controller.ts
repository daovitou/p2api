import { NextFunction, Request, Response } from "express";
import { BaseController } from "./base.controller";
import { PageService } from "../services/page.service";
import { Op } from "sequelize";
import { errorResponse, successResponse } from "../utils/responses";
import { CreatePageDTO } from "../dtos/page.dto";
import { IPage } from "../interfaces/page.interface";
import { UpdateLanguageDTO } from "../dtos/language.dto";

export class PageController implements BaseController {
  private readonly pageService: PageService;
  constructor() {
    this.pageService = new PageService();
  }
  async findAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const pages = Number(req.query.pages) || 1;
      const limit = Number(req.query.limit) || Number.MAX_SAFE_INTEGER;
      const search = req.query.search?.toString() || ("" as string);
      const query = typeof search === "string" ? search.split(" ") : [];
      const conditions = query.map((q) => ({
        name: { [Op.iLike]: `%${q}%` },
      }));
      let info;
      await this.pageService
        .findAll({
          where: { deletedAt: { [Op.is]: null },[Op.and]: conditions },
          offset: (pages - 1) * limit,
          limit: limit,
          order: [["id", "ASC"]],
        })
        .then((response) => {
          // const pageapis = response?.slice(
          //   (pages - 1) * limit,
          //   (pages - 1) * limit + limit
          // );
          const pageapis = response;
          const totalPages = Math.ceil((response?.length || 1) / limit);

          info = {
            pageapis,
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
      return successResponse(res, info);
    } catch (error) {
      next(error);
    }
  }
  async create(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = new CreatePageDTO(req.body) as IPage;
      if (!data || data.name?.trim() == null) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Page name is required!",
        });
      }
      const existing = await this.pageService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Page already existing",
        });
      }
      await this.pageService.create(data);
      return successResponse(res, null, "Create page successful!");
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
      const page = await this.pageService.findById(Number(id));
      if (!page) {
        return errorResponse(res, 404, "No record found!");
      }
      return successResponse(res, page);
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
          message: "Page name is required!",
        });
      }
      if (!Number(id)) {
        return errorResponse(res, 404, "No record found");
      }
      const existing = await this.pageService.findOne({
        where: { name: data.name },
      });
      if (existing) {
        return errorResponse(res, 400, {
          field: "name",
          message: "Page already existing",
        });
      }
      await this.pageService.update(data, { where: { id: id } });
      return successResponse(res, null, "Update page successful!");
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
      // await this.pageService.delete({ where: { id: id } });
      await this.pageService.update(
        { deletedAt: new Date() },
        { where: { id: id, deletedAt: { [Op.is]: null } } }
      );
      return successResponse(res, {}, "Delete page successful.");
    } catch (error) {
      next(error);
    }
  }
}
