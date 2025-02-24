import express, { Router } from "express";
import { PageController } from "../controllers/page.controller";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";

class PageRouter {
  private readonly pageController: PageController;
  public readonly router: Router;
  constructor() {
    this.pageController = new PageController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/",checkPermission(Actions.READ_PAGE), this.pageController.findAll.bind(this.pageController));
    this.router.post("/",checkPermission(Actions.CREATE_PAGE), this.pageController.create.bind(this.pageController));
    this.router.get("/:id",checkPermission(Actions.READ_PAGE), this.pageController.findById.bind(this.pageController));
    this.router.put("/:id",checkPermission(Actions.UPDATE_PAGE), this.pageController.update.bind(this.pageController));
    this.router.delete("/:id",checkPermission(Actions.DELETE_PAGE), this.pageController.delete.bind(this.pageController));
  }
}

export default new PageRouter().router;
