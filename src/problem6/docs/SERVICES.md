# Service Architecture Summary

## Overview

The leaderboard system consists of **3 microservices** and **4 infrastructure components**.

## Microservices

### Service 1: Score Update Service
- **Purpose**: Handle score submissions from clients
- **Responsibilities**:
  - Validate JWT authentication
  - Validate action with business logic
  - Generate unique event_id
  - Publish events to Kafka
  - Return 202 Accepted immediately
- **Scaling**: 3 instances (stateless, behind load balancer)

### Service 2: Event Processor Service
- **Purpose**: Process events from Kafka and update both Redis and ClickHouse
- **Responsibilities**:
  - Consume events from Kafka
  - Check idempotency (skip duplicates)
  - Update 3 Redis sorted sets (last_hour, today, alltime)
  - Insert events into ClickHouse score_events table
  - Update ClickHouse materialized views
  - Handle TTL and window resets
- **Scaling**: 3 instances (one per Kafka partition group)

### Service 3: Leaderboard Service
- **Purpose**: Serve leaderboard queries and push live updates
- **Responsibilities**:
  - Read from Redis sorted sets
  - Decode scores (extract rank, timestamp)
  - Fetch user profiles
  - Return rankings with freshness indicator (HTTP API)
  - Maintain persistent SSE connections
  - Subscribe to Redis pub/sub
  - Selective broadcasting: only notify active viewers
  - Push leaderboard and rank updates to clients
- **Scaling**: 10 instances (each handles ~10K connections)

## Infrastructure Components

### 1. API Gateway / Load Balancer
- JWT validation
- Rate limiting (per-user + global)
- SSL termination
- Request routing

### 2. Kafka Cluster
- 3 brokers
- 12 partitions for score-events topic
- 7-day retention
- Replication factor: 3

### 3. Redis
- Single instance (upgrade to cluster at 50K TPS)
- 3 sorted sets for leaderboards
- Idempotency keys
- Pub/Sub for live update fan-out

### 4. ClickHouse
- Single node (add shards at 50K TPS)
- MergeTree engine for score_events
- Materialized view for all-time aggregation

## Service Communication

```
Client → API Gateway → Score Update Service → Kafka
                                    ↓
                          Event Processor Service
                           ↓              ↓
                         Redis        ClickHouse
                           ↓
                    Leaderboard Service → Client
```