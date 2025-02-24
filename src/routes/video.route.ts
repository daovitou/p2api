import express, { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";

class VideoRouter {
  private readonly videoController: VideoController;
  public readonly router: Router;
  constructor() {
    this.videoController = new VideoController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get(
      "/",
      checkPermission(Actions.READ_VIDEO),
      this.videoController.findAll.bind(this.videoController)
    );
    this.router.post(
      "/",
      checkPermission(Actions.CREATE_VIDEO),
      this.videoController.create.bind(this.videoController)
    );
    this.router.get(
      "/:id",
      checkPermission(Actions.READ_VIDEO),
      this.videoController.findById.bind(this.videoController)
    );
    this.router.put(
      "/:id",
      checkPermission(Actions.UPDATE_VIDEO),
      this.videoController.update.bind(this.videoController)
    );
    this.router.delete(
      "/:id",
      checkPermission(Actions.DELETE_VIDEO),
      this.videoController.delete.bind(this.videoController)
    );
  }
}

export default new VideoRouter().router;
