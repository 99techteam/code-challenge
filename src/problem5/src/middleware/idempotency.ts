import type { RequestHandler, Response } from "express";
import db from "../db/index.ts";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_KEY_LENGTH = 255;
const KEY_PATTERN = /^[A-Za-z0-9_\-]+$/;

const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

type StoredRow = {
  request_hash: string;
  response_status: number | null;
  response_body: string | null;
  created_at: string;
};

const selectStmt = db.prepare<StoredRow, [string, string]>(
  `SELECT request_hash, response_status, response_body, created_at
   FROM idempotency_keys
   WHERE scope = ? AND key = ?`,
);

const insertPendingStmt = db.prepare(
  `INSERT OR IGNORE INTO idempotency_keys
     (key, scope, request_hash, created_at)
   VALUES ($key, $scope, $hash, $now)`,
);

const completeStmt = db.prepare(
  `UPDATE idempotency_keys
   SET response_status = $status,
       response_body   = $body,
       completed_at    = $now
   WHERE scope = $scope AND key = $key`,
);

const deleteStmt = db.prepare(
  `DELETE FROM idempotency_keys WHERE scope = ? AND key = ?`,
);

const pruneStmt = db.prepare(`DELETE FROM idempotency_keys WHERE created_at < ?`);

const hashRequest = (method: string, path: string, body: unknown): string => {
  const payload = JSON.stringify({ method, path, body: body ?? null });
  return new Bun.CryptoHasher("blake2b256").update(payload).digest("hex");
};

const captureResponse = (
  res: Response,
  onComplete: (status: number, body: string | null) => void,
): void => {
  const origJson = res.json.bind(res);
  const origSend = res.send.bind(res);
  let captured = false;

  const capture = (body: unknown): string | null => {
    if (body === undefined) return null;
    if (typeof body === "string") return body;
    if (Buffer.isBuffer(body)) return body.toString("utf8");
    try {
      return JSON.stringify(body);
    } catch {
      return null;
    }
  };

  res.json = (body: unknown) => {
    if (!captured) {
      captured = true;
      onComplete(res.statusCode, capture(body));
    }
    return origJson(body);
  };

  res.send = (body: unknown) => {
    if (!captured) {
      captured = true;
      onComplete(res.statusCode, capture(body));
    }
    return origSend(body);
  };
};

export const createIdempotencyMiddleware = (): RequestHandler => {
  const ttlMs = envInt("IDEMPOTENCY_TTL_MS", DEFAULT_TTL_MS);

  return (req, res, next) => {
    const raw = req.header("Idempotency-Key");
    if (raw === undefined) {
      next();
      return;
    }

    const key = raw.trim();
    if (!key || key.length > MAX_KEY_LENGTH || !KEY_PATTERN.test(key)) {
      res.status(400).json({
        error:
          "Invalid Idempotency-Key header (allowed: 1-255 chars, A-Z, a-z, 0-9, _, -)",
      });
      return;
    }

    const scope = `${req.method} ${req.baseUrl}${req.path}`;
    const requestHash = hashRequest(req.method, scope, req.body);
    const now = new Date().toISOString();

    pruneStmt.run(new Date(Date.now() - ttlMs).toISOString());

    const insert = insertPendingStmt.run({
      $key: key,
      $scope: scope,
      $hash: requestHash,
      $now: now,
    });

    if (insert.changes === 0) {
      const existing = selectStmt.get(scope, key);
      if (!existing) {
        next();
        return;
      }

      if (existing.request_hash !== requestHash) {
        res.status(422).json({
          error:
            "Idempotency-Key was already used with a different request payload",
        });
        return;
      }

      if (existing.response_status === null) {
        res
          .status(409)
          .setHeader("Retry-After", "1")
          .json({ error: "A request with this Idempotency-Key is still in progress" });
        return;
      }

      res.setHeader("Idempotent-Replayed", "true");
      res.status(existing.response_status);
      if (existing.response_body === null) {
        res.send();
      } else {
        res.type("application/json").send(existing.response_body);
      }
      return;
    }

    captureResponse(res, (status, body) => {
      if (status >= 500) {
        deleteStmt.run(scope, key);
        return;
      }
      completeStmt.run({
        $key: key,
        $scope: scope,
        $status: status,
        $body: body,
        $now: new Date().toISOString(),
      });
    });

    next();
  };
};
