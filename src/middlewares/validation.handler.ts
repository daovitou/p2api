import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { errorResponse } from "../utils/responses";

export const bodyValidation = (schema: z.ZodObject<any, any>) =>  async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.safeParseAsync({
            body: req.body,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.errors.map((issue: any) => ({
                // pathmessage: `${issue.path.join(".")} is ${issue.message}`,
                path: `${issue.path[1]}`,
                message: `${issue.message}`,
            }));
            return errorResponse(res, 400, errorMessages)
        } else {
            console.log(error)
            return errorResponse(res, 500, "Internal Server Error")
        }
    }
}