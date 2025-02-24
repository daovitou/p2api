import express, { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

class AuthRouter {
  private readonly authController: AuthController;
  public readonly router: Router;
  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.post("/loggin", this.authController.loggin.bind(this.authController));
  }
}

export default new AuthRouter().router;
