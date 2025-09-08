import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Book } from '../entity/Book';

interface DatabaseMetrics {
  databaseSize: number;
  pageCount: number;
  pageSize: number;
  tableCount: number;
  indexCount: number;
  avgQueryTime: number;
}

interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errors: {
    rate: number;
    count: number;
  };
}

interface SystemMetrics {
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  cpu: {
    usage: number;
  };
  uptime: number;
}

interface ScalabilityMetrics {
  users: {
    activeConnections: number;
    totalRequests: number;
    uniqueUsers: number;
  };
  database: DatabaseMetrics;
  performance: PerformanceMetrics;
  system: SystemMetrics;
  rateLimiting: {
    totalRequests: number;
    allowedRequests: number;
    blockedRequests: number;
    blockRate: number;
    activeClients: number;
  };
}

export class ScalabilityMonitor {
  private static instance: ScalabilityMonitor;
  private requestMetrics: Array<{ timestamp: number; responseTime: number; status: number }> = [];
  private startTime: number = Date.now();
  private activeConnections: Set<string> = new Set();

  public static getInstance(): ScalabilityMonitor {
    if (!ScalabilityMonitor.instance) {
      ScalabilityMonitor.instance = new ScalabilityMonitor();
    }
    return ScalabilityMonitor.instance;
  }

  // Record request metrics for analysis
  recordRequest(responseTime: number, statusCode: number, clientId?: string): void {
    this.requestMetrics.push({
      timestamp: Date.now(),
      responseTime,
      status: statusCode
    });

    if (clientId) {
      this.activeConnections.add(clientId);
    }

    // Keep only last 10,000 requests to prevent memory issues
    if (this.requestMetrics.length > 10000) {
      this.requestMetrics = this.requestMetrics.slice(-5000);
    }

    // Clean up old active connections (older than 5 minutes)
    this.cleanupOldConnections();
  }

  private cleanupOldConnections(): void {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    // In a real implementation, you'd track connection timestamps
    // For now, we'll reset the set periodically
    if (this.requestMetrics.length % 1000 === 0) {
      this.activeConnections.clear();
    }
  }

  // Get comprehensive database metrics
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // SQLite-specific queries for database statistics
      const sizeQuery = await AppDataSource.query(`
        SELECT 
          (page_count * page_size) as database_size,
          page_count,
          page_size
        FROM pragma_page_count(), pragma_page_size()
      `);

      const tableQuery = await AppDataSource.query(`
        SELECT count(*) as table_count 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      const indexQuery = await AppDataSource.query(`
        SELECT count(*) as index_count 
        FROM sqlite_master 
        WHERE type='index' AND name NOT LIKE 'sqlite_%'
      `);

      // Calculate average query time from recent requests
      const recentRequests = this.requestMetrics.slice(-100);
      const avgQueryTime = recentRequests.length > 0 
        ? recentRequests.reduce((sum, req) => sum + req.responseTime, 0) / recentRequests.length
        : 0;

      return {
        databaseSize: sizeQuery[0]?.database_size || 0,
        pageCount: sizeQuery[0]?.page_count || 0,
        pageSize: sizeQuery[0]?.page_size || 0,
        tableCount: tableQuery[0]?.table_count || 0,
        indexCount: indexQuery[0]?.index_count || 0,
        avgQueryTime: Math.round(avgQueryTime * 100) / 100
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      return {
        databaseSize: 0,
        pageCount: 0,
        pageSize: 0,
        tableCount: 0,
        indexCount: 0,
        avgQueryTime: 0
      };
    }
  }

  // Calculate performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    const recentRequests = this.requestMetrics.filter(req => req.timestamp > oneMinuteAgo);
    
    if (recentRequests.length === 0) {
      return {
        responseTime: { avg: 0, p95: 0, p99: 0 },
        throughput: { requestsPerSecond: 0, requestsPerMinute: 0 },
        errors: { rate: 0, count: 0 }
      };
    }

    // Response time calculations
    const responseTimes = recentRequests.map(req => req.responseTime).sort((a, b) => a - b);
    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Throughput calculations
    const requestsPerMinute = recentRequests.length;
    const requestsPerSecond = requestsPerMinute / 60;

    // Error rate calculations
    const errorRequests = recentRequests.filter(req => req.status >= 400);
    const errorRate = (errorRequests.length / recentRequests.length) * 100;

    return {
      responseTime: {
        avg: Math.round(avg * 100) / 100,
        p95: Math.round((responseTimes[p95Index] || 0) * 100) / 100,
        p99: Math.round((responseTimes[p99Index] || 0) * 100) / 100
      },
      throughput: {
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
        requestsPerMinute: requestsPerMinute
      },
      errors: {
        rate: Math.round(errorRate * 100) / 100,
        count: errorRequests.length
      }
    };
  }

  // Get system resource metrics
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    const freeMemory = totalMemory - usedMemory;

    return {
      memory: {
        used: Math.round(usedMemory / 1024 / 1024 * 100) / 100, // MB
        free: Math.round(freeMemory / 1024 / 1024 * 100) / 100, // MB
        total: Math.round(totalMemory / 1024 / 1024 * 100) / 100, // MB
        usage: Math.round((usedMemory / totalMemory) * 100 * 100) / 100 // %
      },
      cpu: {
        usage: Math.round(process.cpuUsage().user / 1000000 * 100) / 100 // Rough CPU usage
      },
      uptime: Math.round((Date.now() - this.startTime) / 1000) // seconds
    };
  }

  // Get comprehensive scalability metrics
  async getScalabilityMetrics(): Promise<ScalabilityMetrics> {
    const databaseMetrics = await this.getDatabaseMetrics();
    const performanceMetrics = this.getPerformanceMetrics();
    const systemMetrics = this.getSystemMetrics();

    // Import rate limiting metrics if available
    let rateLimitingMetrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      blockRate: 0,
      activeClients: 0
    };

    try {
      // Try to get rate limiting metrics from existing metrics collector
      const { metricsCollector } = await import('./metricsController');
      const metrics = metricsCollector.getMetrics();
      if (metrics && (metrics as any).rateLimiting) {
        rateLimitingMetrics = (metrics as any).rateLimiting;
      }
    } catch (error) {
      // Rate limiting metrics not available
    }

    return {
      users: {
        activeConnections: this.activeConnections.size,
        totalRequests: this.requestMetrics.length,
        uniqueUsers: this.activeConnections.size // Simplified
      },
      database: databaseMetrics,
      performance: performanceMetrics,
      system: systemMetrics,
      rateLimiting: rateLimitingMetrics
    };
  }

  // Generate scalability assessment
  async getScalabilityAssessment(): Promise<{
    status: 'green' | 'yellow' | 'red';
    score: number;
    recommendations: string[];
    alerts: string[];
  }> {
    const metrics = await this.getScalabilityMetrics();
    let score = 100;
    const recommendations: string[] = [];
    const alerts: string[] = [];

    // Database size assessment
    const dbSizeGB = metrics.database.databaseSize / (1024 * 1024 * 1024);
    if (dbSizeGB > 5) {
      score -= 30;
      alerts.push('Database size exceeds 5GB - urgent migration needed');
      recommendations.push('Migrate to PostgreSQL immediately');
    } else if (dbSizeGB > 1) {
      score -= 15;
      alerts.push('Database size exceeds 1GB - plan migration');
      recommendations.push('Plan PostgreSQL migration within 2-3 months');
    }

    // Performance assessment
    if (metrics.performance.responseTime.p95 > 500) {
      score -= 25;
      alerts.push('95th percentile response time > 500ms');
      recommendations.push('Optimize database queries and add caching');
    } else if (metrics.performance.responseTime.p95 > 200) {
      score -= 10;
      recommendations.push('Consider query optimization and indexing');
    }

    // Throughput assessment
    if (metrics.performance.throughput.requestsPerSecond > 500) {
      score -= 20;
      alerts.push('High request rate detected - SQLite limits approaching');
      recommendations.push('Implement read replicas or migrate to PostgreSQL');
    } else if (metrics.performance.throughput.requestsPerSecond > 100) {
      score -= 5;
      recommendations.push('Monitor request patterns and consider caching');
    }

    // Error rate assessment
    if (metrics.performance.errors.rate > 5) {
      score -= 25;
      alerts.push('High error rate detected');
      recommendations.push('Investigate error causes and add monitoring');
    } else if (metrics.performance.errors.rate > 1) {
      score -= 10;
      recommendations.push('Monitor error patterns');
    }

    // Memory usage assessment
    if (metrics.system.memory.usage > 90) {
      score -= 20;
      alerts.push('High memory usage - scale vertically');
      recommendations.push('Increase server memory or optimize application');
    } else if (metrics.system.memory.usage > 80) {
      score -= 5;
      recommendations.push('Monitor memory trends');
    }

    // Determine status
    let status: 'green' | 'yellow' | 'red';
    if (score >= 80) {
      status = 'green';
    } else if (score >= 60) {
      status = 'yellow';
    } else {
      status = 'red';
    }

    return {
      status,
      score: Math.max(0, score),
      recommendations,
      alerts
    };
  }

  // Reset all metrics (useful for testing)
  reset(): void {
    this.requestMetrics = [];
    this.activeConnections.clear();
    this.startTime = Date.now();
  }
}

// Express middleware to automatically record request metrics
export function scalabilityMonitoringMiddleware() {
  const monitor = ScalabilityMonitor.getInstance();

  return (req: Request, res: Response, next: Function) => {
    const startTime = Date.now();
    const clientId = req.ip || 'unknown';

    // Override res.end to capture response time and status
    const originalEnd = res.end.bind(res);
    (res as any).end = function(...args: any[]) {
      const responseTime = Date.now() - startTime;
      monitor.recordRequest(responseTime, res.statusCode, clientId);
      return originalEnd(...args);
    };

    next();
  };
}

// Controller endpoints for scalability monitoring
export const scalabilityController = {
  // Get comprehensive scalability metrics
  getMetrics: async (req: Request, res: Response): Promise<void> => {
    try {
      const monitor = ScalabilityMonitor.getInstance();
      const metrics = await monitor.getScalabilityMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error getting scalability metrics:', error);
      res.status(500).json({ error: 'Failed to get scalability metrics' });
    }
  },

  // Get scalability assessment with recommendations
  getAssessment: async (req: Request, res: Response): Promise<void> => {
    try {
      const monitor = ScalabilityMonitor.getInstance();
      const assessment = await monitor.getScalabilityAssessment();
      res.json(assessment);
    } catch (error) {
      console.error('Error getting scalability assessment:', error);
      res.status(500).json({ error: 'Failed to get scalability assessment' });
    }
  },

  // Get Prometheus-formatted metrics for external monitoring
  getPrometheusMetrics: async (req: Request, res: Response): Promise<void> => {
    try {
      const monitor = ScalabilityMonitor.getInstance();
      const metrics = await monitor.getScalabilityMetrics();
      
      const prometheusMetrics = `
# HELP database_size_bytes SQLite database size in bytes
# TYPE database_size_bytes gauge
database_size_bytes ${metrics.database.databaseSize}

# HELP response_time_milliseconds Request response time
# TYPE response_time_milliseconds summary
response_time_milliseconds{quantile="0.5"} ${metrics.performance.responseTime.avg}
response_time_milliseconds{quantile="0.95"} ${metrics.performance.responseTime.p95}
response_time_milliseconds{quantile="0.99"} ${metrics.performance.responseTime.p99}

# HELP requests_per_second Current request rate
# TYPE requests_per_second gauge
requests_per_second ${metrics.performance.throughput.requestsPerSecond}

# HELP error_rate_percent Request error rate percentage
# TYPE error_rate_percent gauge
error_rate_percent ${metrics.performance.errors.rate}

# HELP memory_usage_percent Memory usage percentage
# TYPE memory_usage_percent gauge
memory_usage_percent ${metrics.system.memory.usage}

# HELP active_connections Current active connections
# TYPE active_connections gauge
active_connections ${metrics.users.activeConnections}
      `.trim();

      res.set('Content-Type', 'text/plain');
      res.send(prometheusMetrics);
    } catch (error) {
      console.error('Error generating Prometheus metrics:', error);
      res.status(500).json({ error: 'Failed to generate Prometheus metrics' });
    }
  },

  // Reset metrics (development only)
  resetMetrics: async (req: Request, res: Response): Promise<void> => {
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({ error: 'Reset only allowed in development' });
      return;
    }

    try {
      const monitor = ScalabilityMonitor.getInstance();
      monitor.reset();
      res.json({ message: 'Scalability metrics reset successfully' });
    } catch (error) {
      console.error('Error resetting scalability metrics:', error);
      res.status(500).json({ error: 'Failed to reset scalability metrics' });
    }
  }
};

export default ScalabilityMonitor;
