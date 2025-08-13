import { trace as otelTrace } from "@opentelemetry/api";
import type { Handler } from "express";
import type { Config } from "../config/config";

export function trace(name: string, config: Config): Handler {
	const tracer = otelTrace.getTracer(
		config.get("SERVICE_NAME", "Code Challenge"),
		config.get("SERVICE_VERSION", "1.0.0"),
	);
	return async (_req, _res, next) => {
		const span = tracer.startSpan(name);
		next();
		span.end();
		return;
	};
}
