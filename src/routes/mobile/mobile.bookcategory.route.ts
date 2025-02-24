import express, { Router } from "express";
import { MobileBookCategoryController } from "../../controllers/mobile/mobile.book.category.controller";

class MobileBookCategoryRouter {
  private readonly mobileBookCategoryController: MobileBookCategoryController;
  public readonly router: Router;
  constructor() {
    this.mobileBookCategoryController = new MobileBookCategoryController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", this.mobileBookCategoryController.findAll.bind(this.mobileBookCategoryController));
  }
}

export default new MobileBookCategoryRouter().router;
