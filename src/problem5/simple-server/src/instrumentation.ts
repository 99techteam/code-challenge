import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import type { Config } from "./config/config";

export function setUpOpentelemetry(config: Config) {
	const sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter(),
		metricReader: new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter(),
		}),
		resource: resourceFromAttributes({
			[ATTR_SERVICE_NAME]: config.get("SERVICE_NAME", "Code Challenge"),
			[ATTR_SERVICE_VERSION]: config.get("SERVICE_VERSION", "1.0.0"),
		}),
		instrumentations: [getNodeAutoInstrumentations({})],
	});

	sdk.start();
}
