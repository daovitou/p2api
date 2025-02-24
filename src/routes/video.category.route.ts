import express, { Router } from "express";
import { VideoCategoryController } from "../controllers/video.category.controller";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";

class VideoCategoryRouter {
  private readonly videoCategoryController: VideoCategoryController;
  public readonly router: Router;
  constructor() {
    this.videoCategoryController = new VideoCategoryController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/",checkPermission(Actions.READ_VIDEO_CATEGORY), this.videoCategoryController.findAll.bind(this.videoCategoryController));
    this.router.post("/",checkPermission(Actions.CREATE_VIDEO_CATEGORY), this.videoCategoryController.create.bind(this.videoCategoryController));
    this.router.get("/:id",checkPermission(Actions.READ_VIDEO_CATEGORY), this.videoCategoryController.findById.bind(this.videoCategoryController));
    this.router.put("/:id",checkPermission(Actions.UPDATE_VIDEO_CATEGORY), this.videoCategoryController.update.bind(this.videoCategoryController));
    this.router.delete("/:id",checkPermission(Actions.DELETE_VIDEO_CATEGORY), this.videoCategoryController.delete.bind(this.videoCategoryController));
  }
}

export default new VideoCategoryRouter().router;
