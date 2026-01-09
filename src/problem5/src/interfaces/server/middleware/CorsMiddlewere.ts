import * as express from "express";

export function corsMiddleware(domain: string): express.Handler {
  return (_, res, next) => {
    res.header("Access-Control-Allow-Origin", domain);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  };
}
