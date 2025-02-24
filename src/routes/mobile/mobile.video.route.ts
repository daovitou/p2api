import express, { Router } from "express";
import { MobileVideoController } from "../../controllers/mobile/mobile.video.controller";

class MobileVideoRouter {
  private readonly mobileVideoController: MobileVideoController;
  public readonly router: Router;
  constructor() {
    this.mobileVideoController = new MobileVideoController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", this.mobileVideoController.findAll.bind(this.mobileVideoController));
    this.router.get("/category/:gid", this.mobileVideoController.findByGID.bind(this.mobileVideoController));
    this.router.get("/:id", this.mobileVideoController.findById.bind(this.mobileVideoController));
  }
}

export default new MobileVideoRouter().router;
