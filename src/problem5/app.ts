import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import resourceRoutes from "./route/resource.route";

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "Code Challenge API", 
      version: "1.0.0",
      description: "A simple Express API with TypeORM and Swagger documentation", 
    },
  },
  apis: ["./controller/*.ts", "./route/*.ts"], // Fixed paths
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs)); 

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/resources", resourceRoutes);

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Resources API: http://localhost:${PORT}/api/resources`);
});

export default app;
