import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses";

export const notfoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  return errorResponse(res, 404, "Resources not found");
};
