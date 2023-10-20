import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

export default function (req: Request, res: Response) {
  return res.status(StatusCodes.NOT_FOUND).send("Not found path in system ");
}
