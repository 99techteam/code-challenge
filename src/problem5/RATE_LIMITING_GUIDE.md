# Rate Limiting Implementation Guide

## Overview

This project implements industry-standard API rate limiting using the **Token Bucket algorithm**, following best practices from major cloud providers like Amazon, Google, and Stripe.

## Architecture

### Token Bucket Algorithm

The Token Bucket algorithm provides these benefits:
- **Burst Traffic Support**: Allows temporary spikes in traffic up to the bucket capacity
- **Average Rate Control**: Maintains long-term average request rates
- **Fair Distribution**: Each client gets their own token bucket
- **Memory Efficient**: Tokens are calculated dynamically, not stored

### Core Components

1. **TokenBucket Class** (`src/middleware/rateLimiter.ts`)
   - Manages token consumption and refill logic
   - Handles bucket capacity and refill rates
   - Provides status information for monitoring

2. **Rate Limit Middleware** (`src/middleware/rateLimitMiddleware.ts`)
   - Express middleware for request interception
   - Configurable rate limit profiles
   - Standard HTTP headers for client feedback
   - Integration with metrics collection

3. **Metrics Collection** (`src/controllers/metricsController.ts`)
   - Real-time rate limiting statistics
   - Prometheus-compatible metrics export
   - Performance monitoring capabilities

## Configuration

### Environment Variables

```env
# Enable/disable rate limiting
RATE_LIMIT_ENABLED=true

# Standard profile (read operations)
RATE_LIMIT_STANDARD_CAPACITY=100
RATE_LIMIT_STANDARD_REFILL_RATE=100

# Write operations profile
RATE_LIMIT_WRITE_CAPACITY=50
RATE_LIMIT_WRITE_REFILL_RATE=50

# Burst profile (health checks, metrics)
RATE_LIMIT_BURST_CAPACITY=200
RATE_LIMIT_BURST_REFILL_RATE=150
```

### Rate Limit Profiles

| Profile | Capacity | Refill Rate | Use Case |
|---------|----------|-------------|----------|
| Standard | 100 tokens | 100/minute | GET requests, search operations |
| Write Operations | 50 tokens | 50/minute | POST, PUT, DELETE operations |
| Burst | 200 tokens | 150/minute | Health checks, metrics endpoints |

## Implementation Details

### Token Bucket Logic

```typescript
class TokenBucket {
  consume(tokens: number = 1): boolean {
    this.refillTokens();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true; // Request allowed
    }
    
    return false; // Rate limit exceeded
  }
  
  private refillTokens(): void {
    const now = Date.now();
    const timeDelta = now - this.lastRefill;
    const tokensToAdd = (timeDelta / 60000) * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

### HTTP Headers

All responses include standard rate limiting headers:

```http
X-RateLimit-Limit: 100          # Maximum requests per window
X-RateLimit-Remaining: 95        # Remaining requests in current window
X-RateLimit-Reset: 1704067200    # Unix timestamp when limit resets
X-RateLimit-Policy: 100;w=60     # Rate limit policy (requests;window=seconds)
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067230

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 30
}
```

## Monitoring

### Metrics Endpoints

1. **JSON Metrics**: `GET /api/metrics`
   ```json
   {
     "rateLimiting": {
       "totalRequests": 1250,
       "allowedRequests": 1180,
       "blockedRequests": 70,
       "blockRate": 0.056,
       "activeClients": 25
     }
   }
   ```

2. **Prometheus Format**: `GET /api/metrics/prometheus`
   ```
   # HELP rate_limit_total_requests Total number of requests processed
   # TYPE rate_limit_total_requests counter
   rate_limit_total_requests 1250
   
   # HELP rate_limit_blocked_requests Number of requests blocked by rate limiting
   # TYPE rate_limit_blocked_requests counter
   rate_limit_blocked_requests 70
   ```

### Grafana Integration

Monitor rate limiting effectiveness with these key metrics:
- Request rate vs. capacity
- Block rate percentage
- Active client count
- Response time impact

## Testing

### Unit Tests

The implementation includes comprehensive test coverage:
- Token bucket algorithm correctness
- Middleware integration
- Error handling
- Metrics collection

Run tests:
```bash
npm test
```

### Load Testing

Example with `curl`:
```bash
# Test rate limiting
for i in {1..10}; do
  curl -i http://localhost:3000/api/books
  sleep 0.1
done
```

### Integration Testing

```typescript
// Test rate limit exceeded
const responses = await Promise.all([
  request(app).get('/api/test'),
  request(app).get('/api/test'),
  request(app).get('/api/test'),
  request(app).get('/api/test'), // This should be rate limited
]);

expect(responses[3].status).toBe(429);
expect(responses[3].headers['x-ratelimit-remaining']).toBe('0');
```

## Best Practices

### Client-Side Handling

1. **Respect Headers**: Always check rate limit headers in responses
2. **Implement Backoff**: Use exponential backoff for retry logic
3. **Cache Responses**: Reduce API calls where possible
4. **Monitor Usage**: Track your application's request patterns

### Server-Side Tuning

1. **Profile Selection**: Choose appropriate profiles for different operations
2. **Capacity Planning**: Size buckets based on legitimate usage patterns
3. **Monitoring**: Set up alerts for high block rates
4. **Graceful Degradation**: Ensure rate limiting doesn't break core functionality

### Production Deployment

1. **Redis Backend**: Consider Redis for distributed rate limiting
2. **Geographic Distribution**: Implement per-region rate limiting
3. **User-Based Limits**: Add authenticated user rate limiting
4. **Dynamic Adjustment**: Allow runtime rate limit adjustments

## Troubleshooting

### Common Issues

1. **High Block Rate**: Increase capacity or refill rate
2. **Memory Usage**: Monitor token bucket storage for high-traffic scenarios
3. **False Positives**: Check proxy configurations for client IP detection
4. **Performance Impact**: Optimize token bucket calculations for high throughput

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
```

This provides verbose rate limiting logs including:
- Client identification
- Token consumption details
- Bucket status information
- Rejection reasons

## Security Considerations

1. **IP Spoofing**: Validate client IP detection in proxy environments
2. **Bypass Attempts**: Monitor for suspicious traffic patterns
3. **DoS Protection**: Rate limiting provides basic DoS protection
4. **Fair Usage**: Ensure legitimate users aren't penalized by bad actors

## Future Enhancements

1. **Redis Integration**: Distributed rate limiting across multiple servers
2. **User-Based Limits**: Per-user or per-API-key rate limiting
3. **Dynamic Limits**: Adjust limits based on system load
4. **Geographic Limits**: Different limits per geographic region
5. **Custom Algorithms**: Support for additional rate limiting algorithms
