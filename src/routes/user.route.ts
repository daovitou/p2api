import express, { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { uploadProfile } from "../middlewares/upload.handler";
import { checkPermission } from "../middlewares/permission.handler";
import { Actions } from "../utils/helpers";

class UserRouter {
  private readonly userController: UserController;
  public readonly router: Router;
  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", checkPermission(Actions.READ_USER), this.userController.findAll.bind(this.userController));
    this.router.get("/checkauth", this.userController.checkAuth.bind(this.userController));
    this.router.post("/", checkPermission(Actions.CREATE_USER), uploadProfile, this.userController.create.bind(this.userController));
    this.router.get("/:id", checkPermission(Actions.READ_USER), this.userController.findById.bind(this.userController));
    this.router.put("/:id", checkPermission(Actions.UPDATE_USER),this.userController.update.bind(this.userController));
    this.router.delete("/:id", checkPermission(Actions.DELETE_USER),this.userController.delete.bind(this.userController));
  }
}

export default new UserRouter().router;
