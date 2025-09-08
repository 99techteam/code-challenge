import { Router } from 'express';
import { MetricsController } from '../controllers/metricsController';
import { scalabilityController } from '../controllers/scalabilityController';

const router = Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics in JSON format
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                       description: Total number of requests processed
 *                     rateLimitedRequests:
 *                       type: number
 *                       description: Number of requests that were rate limited
 */
router.get('/', MetricsController.getMetrics);

/**
 * @swagger
 * /api/metrics/prometheus:
 *   get:
 *     summary: Get metrics in Prometheus format
 *     tags: [Metrics]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Prometheus formatted metrics
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/prometheus', MetricsController.getPrometheusMetrics);

/**
 * @swagger
 * /api/metrics/reset:
 *   post:
 *     summary: Reset metrics (development only)
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics reset successfully
 */
router.post('/reset', MetricsController.resetMetrics);

/**
 * @swagger
 * /api/metrics/scalability:
 *   get:
 *     summary: Get comprehensive scalability metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Scalability metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                 database:
 *                   type: object
 *                 performance:
 *                   type: object
 *                 system:
 *                   type: object
 */
router.get('/scalability', scalabilityController.getMetrics);

/**
 * @swagger
 * /api/metrics/scalability/assessment:
 *   get:
 *     summary: Get scalability assessment with recommendations
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Scalability assessment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [green, yellow, red]
 *                 score:
 *                   type: number
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/scalability/assessment', scalabilityController.getAssessment);

/**
 * @swagger
 * /api/metrics/scalability/prometheus:
 *   get:
 *     summary: Get scalability metrics in Prometheus format
 *     tags: [Metrics]
 *     produces:
 *       - text/plain
 *     responses:
 *       200:
 *         description: Prometheus scalability metrics
 */
router.get('/scalability/prometheus', scalabilityController.getPrometheusMetrics);

export default router;
