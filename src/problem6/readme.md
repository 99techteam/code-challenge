# Real-Time Leaderboard Service

A high-performance, real-time leaderboard system supporting 1M MAU with 10K TPS throughput and sub-100ms query latency.

## Overview

This system provides real-time leaderboards across multiple time windows (Last hour, Today, All-time) with live updates via Server-Sent Events. It handles high-throughput score updates while maintaining data consistency and providing fast query responses.

**Key Features:**
- Top 10 leaderboards across 3 time windows
- Live updates via SSE with selective broadcasting (only active viewers)
- Immediate updates (no batching delay)
- Server-side action validation
- Rate limiting (100 actions/min per user)
- 99.9% availability target
- Scalable to 100K+ concurrent users

## Documentation

- [System Design](docs/SYSTEM_DESIGN.md) - Complete architecture, data models, APIs, and design decisions
- [Sequence Diagrams](docs/SEQUENCES.md) - Flow diagrams for key scenarios
- [Service Architecture](docs/SERVICES.md) - Microservices overview and scaling strategy

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Event Bus | Kafka | Durable event streaming, source of truth |
| Cache | Redis | Live leaderboards (sorted sets) |
| Analytics DB | ClickHouse | Long-term event storage, aggregations |
| Live Updates | Server-Sent Events | Real-time push to clients |
| Authentication | JWT | Stateless user authentication |

## Scale & Performance

- **Users**: 1M MAU, 100K DAU, 10K concurrent peak
- **Throughput**: 10K TPS sustained writes
- **Latency**: < 100ms for queries, < 5ms for Redis operations
- **Storage**: ~30TB/month events (compressed to ~3TB with ClickHouse)

## Quick Links

- [Architecture Overview](docs/SYSTEM_DESIGN.md#2-component-architecture)
- [Data Models](docs/SYSTEM_DESIGN.md#3-data-schema)
- [API Reference](docs/SYSTEM_DESIGN.md#4-api-specification)
- [Design Decisions](docs/SYSTEM_DESIGN.md#5-design-decisions)
- [Flow Diagrams](docs/SEQUENCES.md)
