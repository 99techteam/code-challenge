import {
	type Logger as OtelLogger,
	SeverityNumber,
} from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import winston, { format } from "winston";
import type { Config } from "../config/config";
import type { ILogger } from "./logger";

/**
 * this logger come up with default configuration
 * - level: `info`
 * - format: `json`
 * - defaultMeta: `service: resource-service`, `version: 1.0.0`
 * - transports: `console`
 *
 */
export class WinstonLogger implements ILogger {
	private logger: winston.Logger;
	private otelLogger: OtelLogger;

	constructor(
		private readonly config: Config,
		options?: winston.LoggerOptions,
	) {
		const serviceName = this.config.get("SERVICE_NAME", "Code Challenge");
		const serviceVersion = this.config.get("SERVICE_VERSION", "1.0.0");

		const loggerProvider = new LoggerProvider({
			resource: resourceFromAttributes({
				[ATTR_SERVICE_NAME]: serviceName,
				[ATTR_SERVICE_VERSION]: serviceVersion,
			}),
			processors: [
				// Add a processor to export log record
				new BatchLogRecordProcessor(new OTLPLogExporter()),
			],
		});
		this.otelLogger = loggerProvider.getLogger("default");
		this.logger = winston.createLogger({
			level: options?.level ?? "info",
			format:
				options?.format ??
				format.combine(
					format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
					format.json(),
				),
			defaultMeta: options?.defaultMeta ?? {
				service: serviceName,
				version: serviceVersion,
			},
			transports: options?.transports ?? [new winston.transports.Console()],
		});
	}
	private mapLevel(level: SeverityNumber): string {
		switch (level) {
			case SeverityNumber.TRACE:
				return "trace";
			case SeverityNumber.DEBUG:
				return "debug";
			case SeverityNumber.INFO:
				return "info";
			case SeverityNumber.WARN:
				return "warn";
			case SeverityNumber.ERROR:
				return "error";
			case SeverityNumber.FATAL:
				return "fatal";
			default:
				return "info";
		}
	}
	private emit(level: SeverityNumber, message: string, context?: string) {
		this.otelLogger.emit({
			severityNumber: level,
			severityText: this.mapLevel(level),
			body: message,
			attributes: {
				context: context,
			},
		});
	}

	trace(message: string, context?: string): void {
		this.logger.verbose(message, { context });
		this.emit(SeverityNumber.TRACE, message, context);
	}

	debug(message: string, context?: string): void {
		this.logger.debug(message, { context });
		this.emit(SeverityNumber.DEBUG, message, context);
	}

	info(message: string, context?: string): void {
		this.logger.info(message, { context });
		this.emit(SeverityNumber.INFO, message, context);
	}

	warn(message: string, context?: string): void {
		this.logger.warn(message, { context });
		this.emit(SeverityNumber.WARN, message, context);
	}

	error(message: string, stack?: string, context?: string): void {
		this.logger.error(message, { stack, context });

		this.emit(SeverityNumber.ERROR, message, context);
	}

	fatal(message: string, context?: string): void {
		this.logger.crit(message, { fatal: true, context });
		this.emit(SeverityNumber.FATAL, message, context);
	}
}
