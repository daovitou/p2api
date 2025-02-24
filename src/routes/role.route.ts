import { Router } from "express";
import { RoleController } from "../controllers/role.controller";

class RoleRouter {
  public readonly router: Router;
  private readonly roleController: RoleController;
  constructor() {
    this.router = Router();
    this.roleController = new RoleController();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", this.roleController.findAll.bind(this.roleController));
  }
}

export default new RoleRouter().router;
