import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses";

export const serverHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.log(error);
  return errorResponse(res, 500, "Server not response")
  // if ((error.name = "SequelizeUniqueConstraintError")) {
  //   if (error.errors) {
  //     return errorResponse(res, 400, {
  //       path: error.errors[0].path,
  //       message: error.errors[0].message,
  //     });
  //   } else {
  //     return errorResponse(res,400,"Bad Request");
  //   }
  // } else {
  //   return errorResponse(res, 500, "Server not response");
  // }
};
