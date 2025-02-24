import express, { Router } from "express";
import { MobileVideoCategoryController } from "../../controllers/mobile/mobile.video.category.controller";

class MobileVideoCategoryRouter {
  private readonly mobileVideoCategoryController: MobileVideoCategoryController;
  public readonly router: Router;
  constructor() {
    this.mobileVideoCategoryController = new MobileVideoCategoryController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", this.mobileVideoCategoryController.findAll.bind(this.mobileVideoCategoryController));
  }
}

export default new MobileVideoCategoryRouter().router;
