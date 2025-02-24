import express, { Router } from "express";
import { LanguageController } from "../controllers/language.controller";
import { Actions } from "../utils/helpers";
import { checkPermission } from "../middlewares/permission.handler";

class LanuageRouter {
  private readonly languageController: LanguageController;
  public readonly router: Router;
  constructor() {
    this.languageController = new LanguageController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/",checkPermission(Actions.READ_LANGUAGE), this.languageController.findAll.bind(this.languageController));
    this.router.post("/",checkPermission(Actions.CREATE_LANGUAGE), this.languageController.create.bind(this.languageController));
    this.router.get("/:id",checkPermission(Actions.READ_LANGUAGE), this.languageController.findById.bind(this.languageController));
    this.router.put("/:id",checkPermission(Actions.UPDATE_LANGUAGE), this.languageController.update.bind(this.languageController));
    this.router.delete("/:id",checkPermission(Actions.DELETE_LANGUAGE), this.languageController.delete.bind(this.languageController));
  }
}

export default new LanuageRouter().router;
