import express, { Router } from "express";
import { BookCategoryController } from "../controllers/book.category.controller";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";
import { bodyValidation } from "../middlewares/validation.handler";
import { BookCategorySchema } from "../schemas/book.category.schema";

class BookCategoryRouter {
  private readonly bookCategoryController: BookCategoryController;
  public readonly router: Router;
  constructor() {
    this.bookCategoryController = new BookCategoryController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", checkPermission(Actions.READ_BOOK_CATEGORY), this.bookCategoryController.findAll.bind(this.bookCategoryController));
    this.router.post("/", checkPermission(Actions.CREATE_BOOK_CATEGORY), bodyValidation(BookCategorySchema), this.bookCategoryController.create.bind(this.bookCategoryController));
    this.router.get("/:id", checkPermission(Actions.READ_BOOK_CATEGORY), this.bookCategoryController.findById.bind(this.bookCategoryController));
    this.router.put("/:id", checkPermission(Actions.UPDATE_BOOK_CATEGORY), bodyValidation(BookCategorySchema), this.bookCategoryController.update.bind(this.bookCategoryController));
    this.router.delete("/:id", checkPermission(Actions.DELETE_BOOK_CATEGORY), this.bookCategoryController.delete.bind(this.bookCategoryController));
  }
}

export default new BookCategoryRouter().router;
