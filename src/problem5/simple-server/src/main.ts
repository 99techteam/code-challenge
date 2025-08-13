import "reflect-metadata";
import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Config } from "./config/config";
import { setUpOpentelemetry } from "./instrumentation";
import { WinstonLogger } from "./logger/winston.logger";
import { exceptionHandler } from "./middlewares/exception.middleware";
import { createResourceRoute } from "./modules/resource/resource.route";

function bootstrap() {
	const config = new Config();
	const app = express();
	setUpOpentelemetry(config);
	const logger = new WinstonLogger(config);
	const apiRoute = express.Router();
	const resourceRoutes = express.Router();
	const morganMiddleware = morgan(
		":method :url :status :res[content-length] - :response-time ms",
		{
			stream: {
				write: (message) => logger.info(message.trim()),
			},
		},
	);
	app.use(bodyParser.json());
	app.use(morganMiddleware);

	createResourceRoute(resourceRoutes, config);

	app.use("/api", apiRoute);
	apiRoute.use("/resource", resourceRoutes);

	const ApiDefinition = swaggerJsdoc({
		failOnErrors: true,
		definition: {
			openapi: "3.1.0",
			info: {
				title: config.get("SERVICE_NAME", "Code Challenge"),
				version: config.get("SERVICE_VERSION", "1.0.0"),
			},
		},
		apis: ["./src/**/*.ts"],
	});

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(ApiDefinition));
	app.use(exceptionHandler);
	const port = config.get("PORT", "5000");
	app.listen(port, () => {
		logger.info(`Server is running on port ${port}`);
	});
}

bootstrap();
