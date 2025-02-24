import express, { Router } from "express"
import { MinioController } from "../controllers/minio.controller";
import { uploadProfile } from "../middlewares/upload.handler";

const minioRoute = express.Router()

class MinioRouter {
    private readonly minioController: MinioController
    public readonly router: Router;

    constructor() {
        this.minioController = new MinioController()
        this.router = Router();
        this.initRouter()
    }
    private initRouter() {
        this.router.get("/",uploadProfile,this.minioController.minioUpload.bind(this.minioController));
    }
}

export default new MinioRouter().router;