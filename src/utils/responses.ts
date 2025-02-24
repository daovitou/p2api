import { Response } from "express";

export const successResponse = async (
  res: Response,
  data: any,
  message: string = "Successful"
): Promise<any> => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = async (
  res: Response,
  status: number,
  error: any
): Promise<any> => {
  return res.status(status).json({
    success: false,
    error,
  });
};
