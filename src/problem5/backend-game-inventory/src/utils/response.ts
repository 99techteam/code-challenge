import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  meta: any = {}
) => {
  return res.status(200).json({
    success: true,
    data,
    meta,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  status = 500,
  details: any = null
) => {
  return res.status(status).json({
    success: false,
    error: message,
    details,
  });
};