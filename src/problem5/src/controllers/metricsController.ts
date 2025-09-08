import { Request, Response } from 'express';

interface MetricsData {
  totalRequests: number;
  rateLimitedRequests: number;
  requestsPerEndpoint: Record<string, number>;
  rateLimitViolationsPerKey: Record<string, number>;
  lastReset: Date;
}

class MetricsCollector {
  private metrics: MetricsData;

  constructor() {
    this.metrics = {
      totalRequests: 0,
      rateLimitedRequests: 0,
      requestsPerEndpoint: {},
      rateLimitViolationsPerKey: {},
      lastReset: new Date()
    };
  }

  incrementTotalRequests(): void {
    this.metrics.totalRequests++;
  }

  incrementRateLimitedRequests(): void {
    this.metrics.rateLimitedRequests++;
  }

  incrementEndpointRequest(endpoint: string): void {
    this.metrics.requestsPerEndpoint[endpoint] = (this.metrics.requestsPerEndpoint[endpoint] || 0) + 1;
  }

  incrementRateLimitViolation(key: string): void {
    this.metrics.rateLimitViolationsPerKey[key] = (this.metrics.rateLimitViolationsPerKey[key] || 0) + 1;
  }

  getMetrics(): MetricsData {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      rateLimitedRequests: 0,
      requestsPerEndpoint: {},
      rateLimitViolationsPerKey: {},
      lastReset: new Date()
    };
  }

  /**
   * Generate Prometheus-compatible metrics
   */
  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();
    const timestamp = Date.now();
    
    let prometheusOutput = '';
    
    // Total requests counter
    prometheusOutput += '# HELP api_requests_total Total number of API requests\n';
    prometheusOutput += '# TYPE api_requests_total counter\n';
    prometheusOutput += `api_requests_total ${metrics.totalRequests} ${timestamp}\n\n`;
    
    // Rate limited requests counter
    prometheusOutput += '# HELP api_rate_limited_requests_total Total number of rate limited requests\n';
    prometheusOutput += '# TYPE api_rate_limited_requests_total counter\n';
    prometheusOutput += `api_rate_limited_requests_total ${metrics.rateLimitedRequests} ${timestamp}\n\n`;
    
    // Rate limit ratio gauge
    const rateLimitRatio = metrics.totalRequests > 0 
      ? (metrics.rateLimitedRequests / metrics.totalRequests) 
      : 0;
    prometheusOutput += '# HELP api_rate_limit_ratio Ratio of rate limited requests to total requests\n';
    prometheusOutput += '# TYPE api_rate_limit_ratio gauge\n';
    prometheusOutput += `api_rate_limit_ratio ${rateLimitRatio.toFixed(4)} ${timestamp}\n\n`;
    
    // Requests per endpoint
    prometheusOutput += '# HELP api_requests_per_endpoint_total Total requests per endpoint\n';
    prometheusOutput += '# TYPE api_requests_per_endpoint_total counter\n';
    for (const [endpoint, count] of Object.entries(metrics.requestsPerEndpoint)) {
      const sanitizedEndpoint = endpoint.replace(/[^a-zA-Z0-9_]/g, '_');
      prometheusOutput += `api_requests_per_endpoint_total{endpoint="${sanitizedEndpoint}"} ${count} ${timestamp}\n`;
    }
    prometheusOutput += '\n';
    
    // Rate limit violations per key (IP/client)
    prometheusOutput += '# HELP api_rate_limit_violations_per_client_total Rate limit violations per client\n';
    prometheusOutput += '# TYPE api_rate_limit_violations_per_client_total counter\n';
    for (const [key, count] of Object.entries(metrics.rateLimitViolationsPerKey)) {
      // Hash the key for privacy (don't expose raw IPs)
      const hashedKey = Buffer.from(key).toString('base64').slice(0, 8);
      prometheusOutput += `api_rate_limit_violations_per_client_total{client_hash="${hashedKey}"} ${count} ${timestamp}\n`;
    }
    
    return prometheusOutput;
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector();

/**
 * Middleware to collect request metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: Function): void {
  metricsCollector.incrementTotalRequests();
  metricsCollector.incrementEndpointRequest(`${req.method} ${req.route?.path || req.path}`);
  
  // Track if this request gets rate limited
  const originalStatus = res.status;
  res.status = function(code: number) {
    if (code === 429) {
      metricsCollector.incrementRateLimitedRequests();
      
      // Extract client key for violation tracking
      const forwarded = req.headers['x-forwarded-for'] as string;
      const realIp = req.headers['x-real-ip'] as string;
      const clientKey = forwarded?.split(',')[0] || realIp || req.socket.remoteAddress || 'unknown';
      metricsCollector.incrementRateLimitViolation(clientKey);
    }
    return originalStatus.call(this, code);
  };
  
  next();
}

/**
 * Metrics endpoint controller
 */
export class MetricsController {
  /**
   * Get metrics in JSON format
   */
  static getMetrics(req: Request, res: Response): void {
    const metrics = metricsCollector.getMetrics();
    
    res.json({
      success: true,
      data: {
        ...metrics,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  }

  /**
   * Get metrics in Prometheus format
   */
  static getPrometheusMetrics(req: Request, res: Response): void {
    const prometheusMetrics = metricsCollector.getPrometheusMetrics();
    
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusMetrics);
  }

  /**
   * Reset metrics (useful for testing)
   */
  static resetMetrics(req: Request, res: Response): void {
    metricsCollector.reset();
    
    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Health check with rate limit status
   */
  static healthCheck(req: Request, res: Response): void {
    const metrics = metricsCollector.getMetrics();
    const rateLimitRatio = metrics.totalRequests > 0 
      ? (metrics.rateLimitedRequests / metrics.totalRequests) 
      : 0;
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      rateLimit: {
        enabled: true,
        totalRequests: metrics.totalRequests,
        rateLimitedRequests: metrics.rateLimitedRequests,
        rateLimitRatio: parseFloat(rateLimitRatio.toFixed(4)),
        capacity: parseInt(process.env.RATE_LIMIT_CAPACITY || '100', 10),
        refillRate: parseFloat(process.env.RATE_LIMIT_REFILL_RATE || '1.67')
      }
    });
  }
}
