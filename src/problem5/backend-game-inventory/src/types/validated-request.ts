import { Request } from "express";

export type ValidatedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> = Request & {
  validated: {
    body: TBody;
    query: TQuery;
    params: TParams;
  };
};