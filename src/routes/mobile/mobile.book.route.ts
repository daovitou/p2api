import express, { Router } from "express";
import { MobileBookController } from "../../controllers/mobile/mobile.book.controller";

class MobileBookCategoryRouter {
    private readonly mobileBookController: MobileBookController;
    public readonly router: Router;
    constructor() {
        this.mobileBookController = new MobileBookController();
        this.router = Router();
        this.initRouter();
    }
    private initRouter() {
        this.router.get("/", this.mobileBookController.findAll.bind(this.mobileBookController));
        this.router.get("/category/:gid", this.mobileBookController.findByGID.bind(this.mobileBookController));
        this.router.get("/:id", this.mobileBookController.findById.bind(this.mobileBookController));
    }
}

export default new MobileBookCategoryRouter().router;
