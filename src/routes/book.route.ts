import express, { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { uploadMultiple } from "../middlewares/upload.handler";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";
import { bodyValidation } from "../middlewares/validation.handler";
import { BookSchema } from "../schemas/book.schema";

class BookRouter {
  private readonly bookController: BookController;
  public readonly router: Router;
  constructor() {
    this.bookController = new BookController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/",checkPermission(Actions.READ_BOOK), this.bookController.findAll.bind(this.bookController));
    this.router.post("/",checkPermission(Actions.CREATE_BOOK),bodyValidation(BookSchema),uploadMultiple ,this.bookController.create.bind(this.bookController));
    this.router.get("/:id",checkPermission(Actions.READ_BOOK), this.bookController.findById.bind(this.bookController));
    this.router.put("/:id",checkPermission(Actions.UPDATE_BOOK),uploadMultiple, this.bookController.update.bind(this.bookController));
    this.router.delete("/:id",checkPermission(Actions.DELETE_BOOK), this.bookController.delete.bind(this.bookController));
    this.router.get("/code/:code",checkPermission(Actions.READ_BOOK), this.bookController.findBookByCode.bind(this.bookController));
  }
}

export default new BookRouter().router;
