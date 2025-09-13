# Execution Flow Diagrams

## 1. System Architecture Overview

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                     Client Layer                            │
                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
                    │  │   Web App   │  │ Mobile App  │  │ Game Client │        │
                    │  │  (React)    │  │(iOS/Android)│  │   (Unity)   │        │
                    │  └─────────────┘  └─────────────┘  └─────────────┘        │
                    └─────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
                    ┌─────────────────────────────────────────────────────────────┐
                    │                   Network Layer                             │
                    │           ┌─────────────┐  ┌─────────────┐                 │
                    │           │Load Balancer│  │   CDN       │                 │
                    │           │  (Nginx)    │  │(CloudFlare) │                 │
                    │           └─────────────┘  └─────────────┘                 │
                    └─────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
                    ┌─────────────────────────────────────────────────────────────┐
                    │                  API Gateway Layer                          │
                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
                    │  │ Rate Limiter│  │   Auth      │  │   Router    │        │
                    │  │   (Redis)   │  │  Validator  │  │  (Express)  │        │
                    │  └─────────────┘  └─────────────┘  └─────────────┘        │
                    └─────────────────────────────────────────────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          ▼                          │
                    │              ┌─────────────────┐                    │
                    │              │  Service Layer  │                    │
                    │              └─────────────────┘                    │
                    │                          │                          │
        ┌───────────▼──────────┐   ┌──────────▼──────────┐   ┌──────────▼──────────┐
        │   Auth Service       │   │   Score Service     │   │  WebSocket Hub      │
        │                      │   │                     │   │                     │
        │ • JWT Validation     │   │ • Score Updates     │   │ • Real-time Updates │
        │ • User Authentication│   │ • Leaderboard Logic │   │ • Event Broadcasting│
        │ • Session Management │   │ • Anti-cheat Logic  │   │ • Connection Mgmt   │
        └──────────────────────┘   └─────────────────────┘   └─────────────────────┘
                    │                          │                          │
                    ▼                          ▼                          ▼
        ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
        │   User Store    │      │   Score Cache   │      │  Event Queue    │
        │  (PostgreSQL)   │      │    (Redis)      │      │ (Redis Pub/Sub) │
        │                 │      │                 │      │                 │
        │ • User Profiles │      │ • Leaderboard   │      │ • Event Stream  │
        │ • Credentials   │      │ • Session Data  │      │ • Message Queue │
        │ • Permissions   │      │ • Rate Limits   │      │ • Notifications │
        └─────────────────┘      └─────────────────┘      └─────────────────┘
                                            │
                                            ▼
                                 ┌─────────────────┐
                                 │ Score Database  │
                                 │  (PostgreSQL)   │
                                 │                 │
                                 │ • Score History │
                                 │ • Action Logs   │
                                 │ • Audit Trail   │
                                 └─────────────────┘
```

## 2. Score Update Flow

```
Client Action                API Processing              Database Updates            Real-time Broadcast
─────────────────           ─────────────────           ─────────────────           ─────────────────

┌─────────────┐              ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ User Action │              │   Gateway   │              │  Validation │              │ Event Queue │
│  Complete   │──────────────▶│Rate Limit + │──────────────▶│ & Security  │──────────────▶│Redis Pub/Sub│
│   Level     │              │   Auth      │              │   Checks    │              │             │
└─────────────┘              └─────────────┘              └─────────────┘              └─────────────┘
       │                              │                              │                              │
       │ POST /scores/update          │ JWT + Rate Check            │ HMAC Verify                   │ Publish Event
       │                              │                              │                              │
       ▼                              ▼                              ▼                              ▼
┌─────────────┐              ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│   Signed    │              │Score Service│              │  Database   │              │ WebSocket   │
│   Request   │              │ Processing  │              │   Updates   │              │   Clients   │
│             │              │             │              │             │              │             │
│• actionId   │              │• Validate   │              │• Save Action│              │• Broadcast  │
│• signature  │              │• Process    │              │• Update User│              │• Update UI  │
│• scoreData  │              │• Calculate  │              │• Recalc Rank│              │• Show Changes│
└─────────────┘              └─────────────┘              └─────────────┘              └─────────────┘
                                      │                              │                              │
                                      │                              │                              │
                                      ▼                              ▼                              ▼
                             ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
                             │    Cache    │              │Leaderboard  │              │   Client    │
                             │   Update    │              │   Update    │              │  Updates    │
                             │             │              │             │              │             │
                             │• Redis Set  │              │• New Ranks  │              │• Score UI   │
                             │• Cache      │              │• Top 10     │              │• Rank Change│
                             │  Refresh    │              │• Statistics │              │• Animations │
                             └─────────────┘              └─────────────┘              └─────────────┘
```

## 3. Security & Anti-Cheat Flow

```
Client Side                  Server Side Validation       Detection & Response
─────────────                ─────────────────────        ─────────────────────

┌─────────────┐              ┌─────────────────────┐       ┌─────────────────────┐
│   Action    │              │   Request Arrives   │       │   Pattern Analysis  │
│  Generated  │──────────────▶│                     │──────▶│                     │
│             │              │ • Rate Limit Check  │       │ • Score Progression │
│• Calculate  │              │ • Auth Validation   │       │ • Time Analysis     │
│  Score      │              │ • Input Validation  │       │ • Behavior Pattern  │
│• Generate   │              └─────────────────────┘       │ • Statistical Check │
│  Signature  │                          │                 └─────────────────────┘
│• Timestamp  │                          │                             │
└─────────────┘                          ▼                             │
       │                     ┌─────────────────────┐                   │
       │                     │  Signature Check    │                   │
       │                     │                     │                   ▼
       │                     │ • HMAC Verification │       ┌─────────────────────┐
       │                     │ • Timestamp Window  │       │  Anomaly Detection  │
       │                     │ • Nonce/Replay     │       │                     │
       │                     │   Protection        │       │ • Flag Suspicious   │
       │                     └─────────────────────┘       │ • Rate Limit User   │
       │                                 │                 │ • Alert Admins      │
       │                                 │                 │ • Log Incident      │
       ▼                                 ▼                 └─────────────────────┘
┌─────────────┐              ┌─────────────────────┐                   │
│  HTTP POST  │              │   Score Validation  │                   │
│             │              │                     │                   ▼
│• Headers    │              │ • Max Score Check   │       ┌─────────────────────┐
│• JWT Token  │              │ • Time Constraints  │       │    Response         │
│• Payload    │              │ • Logic Validation  │       │                     │
│• Signature  │              │ • Sequence Check    │       │ • Accept/Reject     │
└─────────────┘              └─────────────────────┘       │ • Error Codes       │
                                         │                 │ • Audit Logging     │
                                         │                 │ • User Notification │
                                         ▼                 └─────────────────────┘
                             ┌─────────────────────┐
                             │   Database Write    │
                             │                     │
                             │ • Action Recorded   │
                             │ • Score Updated     │
                             │ • Audit Trail       │
                             │ • Rank Recalculated │
                             └─────────────────────┘
```

## 4. WebSocket Real-time Communication Flow

```
Connection Phase             Event Broadcasting           Error Handling
─────────────────           ───────────────────          ───────────────

┌─────────────┐              ┌─────────────────┐          ┌─────────────────┐
│   Client    │              │  Score Updated  │          │  Connection     │
│  Connects   │──────────────▶│                 │──────────▶│   Errors        │
│             │              │ • New Score     │          │                 │
│• WebSocket  │              │ • Rank Change   │          │• Network Issues │
│  Handshake  │              │ • Leaderboard   │          │• Auth Failures  │
│• JWT Auth   │              │   Update        │          │• Rate Limits    │
└─────────────┘              └─────────────────┘          │• Reconnection   │
       │                              │                   └─────────────────┘
       │                              │                             │
       ▼                              ▼                             │
┌─────────────┐              ┌─────────────────┐                   │
│   Server    │              │   Redis Pub/Sub │                   │
│ Validates   │              │                 │                   │
│             │              │ • Publish Event │                   ▼
│• Token      │              │ • Fan-out to    │          ┌─────────────────┐
│• Rate Limit │              │   All Clients   │          │   Auto Recovery │
│• Store Conn │              │ • Message Queue │          │                 │
└─────────────┘              └─────────────────┘          │• Exponential    │
       │                              │                   │  Backoff        │
       │                              │                   │• State Sync     │
       ▼                              ▼                   │• Event Replay   │
┌─────────────┐              ┌─────────────────┐          └─────────────────┘
│ Subscribe   │              │  All Connected  │
│ to Events   │              │    Clients      │
│             │              │                 │
│• Channels   │              │ • Receive Event │
│• User-      │              │ • Update UI     │
│  specific   │              │ • Trigger       │
│• Global     │              │   Animations    │
└─────────────┘              └─────────────────┘
```

## 5. Database Transaction Flow

```
Read Operations              Write Operations             Cache Management
────────────────            ─────────────────            ─────────────────

┌─────────────┐              ┌─────────────────┐          ┌─────────────────┐
│GET Request  │              │POST Score Update│          │   Cache Check   │
│             │──Cache──────▶│                 │──────────▶│                 │
│• Leaderboard│   Hit        │ • Begin         │          │ • Redis Lookup  │
│• User Score │              │   Transaction   │          │ • TTL Check     │
│• Rankings   │              │ • Validate      │          │ • Key Existence │
└─────────────┘              │ • Insert Action │          └─────────────────┘
       │                     │ • Update Score  │                   │
       │Cache                │ • Recalc Rank   │                   │
       │Miss                 │ • Commit        │                   ▼
       ▼                     └─────────────────┘          ┌─────────────────┐
┌─────────────┐                       │                  │   Cache Update  │
│ Database    │                       │                  │                 │
│   Query     │                       │                  │ • Set New Data  │
│             │                       ▼                  │ • Update TTL    │
│• Complex    │              ┌─────────────────┐          │ • Invalidate    │
│  Joins      │              │Transaction Audit│          │   Related Keys  │
│• Indexed    │              │                 │          └─────────────────┘
│  Lookups    │              │ • Action Log    │                   │
│• Pagination │              │ • Before/After  │                   │
└─────────────┘              │ • User Context  │                   ▼
       │                     │ • Timestamp     │          ┌─────────────────┐
       │                     └─────────────────┘          │  Cache Response │
       ▼                                                  │                 │
┌─────────────┐                                          │ • Serve from    │
│   Cache     │                                          │   Cache         │
│   Store     │                                          │ • Fast Response │
│             │                                          │ • Reduced Load  │
│• Save to    │                                          └─────────────────┘
│  Redis      │
│• Set TTL    │
│• Tag Keys   │
└─────────────┘
```