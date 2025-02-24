import express, { Router } from "express";
import { PageController } from "../../controllers/mobile/mobile.page.controller";

class MobilePageRouter {
    private readonly pageController: PageController;
    public readonly router: Router;
    constructor() {
        this.pageController = new PageController();
        this.router = Router();
        this.initRouter();
    }
    private initRouter() {
        this.router.get("/:slug", this.pageController.findByPage.bind(this.pageController));
    }
}

export default new MobilePageRouter().router;
