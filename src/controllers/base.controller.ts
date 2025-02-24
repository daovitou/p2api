import { NextFunction, Request, Response } from "express";

export interface BaseController {
  findAll(req: Request, res: Response, next: NextFunction): Promise<any>;
  create(req: Request, res: Response, next: NextFunction): Promise<any>;
  findById(req: Request, res: Response, next: NextFunction): Promise<any>;
  update(req: Request, res: Response, next: NextFunction): Promise<any>;
  delete(req: Request, res: Response, next: NextFunction): Promise<any>;
}
