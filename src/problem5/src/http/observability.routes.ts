import {
  Router,
  type Request,
  type Response,
} from "express";
import { ObservabilityService } from "../services/observability.service";
import {
  parseAuditLogFilters,
  parseLogId,
  parseTroubleLogFilters,
} from "./observability.validation";

export function createAuditLogRouter(
  service: ObservabilityService,
): Router {
  const router = Router();

  router.get("/", (request: Request, response: Response) => {
    const result = service.listAuditLogs(
      parseAuditLogFilters(
        request.query as Record<string, unknown>,
      ),
    );

    response.json({
      data: result.items,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  });

  router.get("/:id", (request: Request, response: Response) => {
    response.json({
      data: service.getAuditLog(
        parseLogId(request.params.id),
      ),
    });
  });

  return router;
}

export function createTroubleLogRouter(
  service: ObservabilityService,
): Router {
  const router = Router();

  router.get("/", (request: Request, response: Response) => {
    const result = service.listTroubleLogs(
      parseTroubleLogFilters(
        request.query as Record<string, unknown>,
      ),
    );

    response.json({
      data: result.items,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  });

  router.get("/:id", (request: Request, response: Response) => {
    response.json({
      data: service.getTroubleLog(
        parseLogId(request.params.id),
      ),
    });
  });

  return router;
}
