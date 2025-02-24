import express, { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

class DashboardRouter {
  private readonly dashboardController: DashboardController;
  public readonly router: Router;
  constructor() {
    this.dashboardController = new DashboardController();
    this.router = Router();
    this.initRouter();
  }
  private initRouter() {
    this.router.get("/", this.dashboardController.findAll.bind(this.dashboardController));
  }
}

export default new DashboardRouter().router;
