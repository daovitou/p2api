import { FilterRuleName, S3Client } from "@aws-sdk/client-s3"
import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/responses";
import * as Minio from "minio"
import multer from "multer";
import multerS3 from "multer-s3";

export class MinioController {

    async uploadFile(req: Request, res: Response, next: NextFunction) {
        try {
            return successResponse(res, "")
        } catch (error) {
            next(error)
        }
    }

    async minioUpload(req: any, res: Response, next: NextFunction) {
        try {
            return successResponse(res, req.file)
        } catch (error) {
            next(error)
        }
    }

}