# Execution Flow Diagrams

## Complete System Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT BROWSER                                       │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────────────┐         ┌──────────────────────┐       ┌─────────────────┐ │
│  │   Scoreboard UI     │         │   Game/Activity      │       │  WebSocket      │ │
│  │   (Top 10 Display)  │◄────────│   Component          │       │  Client         │ │
│  │                     │         │                      │       │                 │ │
│  │  • Real-time update │         │  • User actions      │       │  • Live updates │ │
│  │  • Rankings         │         │  • Trigger events    │       │  • Reconnection │ │
│  │  • Animations       │         │  • Client validation │       │  • Heartbeat    │ │
│  └─────────▲───────────┘         └──────────┬───────────┘       └────────▲────────┘ │
│            │                                 │                            │          │
└────────────┼─────────────────────────────────┼────────────────────────────┼──────────┘
             │                                 │                            │
             │ HTTPS                           │ HTTPS                      │ WSS
             │                                 │                            │
┌────────────┼─────────────────────────────────┼────────────────────────────┼──────────┐
│            │              API GATEWAY / LOAD BALANCER                     │          │
│            │                                 │                            │          │
│     ┌──────▼──────────┐             ┌───────▼───────────┐        ┌───────▼────────┐ │
│     │  HTTPS Endpoint │             │  HTTPS Endpoint   │        │  WSS Endpoint  │ │
│     │  (REST API)     │             │  (REST API)       │        │  (WebSocket)   │ │
│     └──────┬──────────┘             └───────┬───────────┘        └───────┬────────┘ │
└────────────┼─────────────────────────────────┼────────────────────────────┼──────────┘
             │                                 │                            │
┌────────────┼─────────────────────────────────┼────────────────────────────┼──────────┐
│            │           APPLICATION SERVER CLUSTER                         │          │
├────────────┼─────────────────────────────────┼────────────────────────────┼──────────┤
│            │                                 │                            │          │
│     ┌──────▼──────────┐             ┌───────▼───────────┐        ┌───────▼────────┐ │
│     │ Authentication  │             │ Authentication    │        │ Authentication │ │
│     │ Middleware      │             │ Middleware        │        │ Middleware     │ │
│     └──────┬──────────┘             └───────┬───────────┘        └───────┬────────┘ │
│            │                                 │                            │          │
│     ┌──────▼──────────┐             ┌───────▼───────────┐        ┌───────▼────────┐ │
│     │ Rate Limiter    │             │ Rate Limiter      │        │ Rate Limiter   │ │
│     └──────┬──────────┘             └───────┬───────────┘        └───────┬────────┘ │
│            │                                 │                            │          │
│     ┌──────▼──────────────────────┐  ┌──────▼───────────────────────┐   │          │
│     │  Leaderboard Controller     │  │  Score Controller            │   │          │
│     │                             │  │                              │   │          │
│     │  GET /leaderboard          │  │  POST /actions/request       │   │          │
│     │  • Fetch top 10            │  │  • Generate action token     │   │          │
│     │  • Cache check             │  │  • Store token hash          │   │          │
│     └──────┬──────────────────────┘  │                              │   │          │
│            │                         │  POST /actions/complete      │   │          │
│            │                         │  • Validate token            │   │          │
│            │                         │  • Anti-cheat checks         │   │          │
│            │                         │  • Update score              │   │          │
│            │                         │  • Broadcast update          │   │          │
│            │                         └──────┬───────────────────────┘   │          │
│            │                                │                           │          │
│     ┌──────▼──────────────────────┐  ┌──────▼───────────────────────┐  │          │
│     │  Leaderboard Service        │  │  Score Service               │  │          │
│     │                             │  │                              │  │          │
│     │  • Get top 10 from cache   │  │  • Generate secure token     │  │          │
│     │  • Update cache on change  │  │  • Validate action token     │  │          │
│     │  • Emit real-time updates  │  │  • Calculate score increment │  │          │
│     └──────┬──────────────────────┘  │  • Update user score         │  │          │
│            │                         └──────┬───────────────────────┘  │          │
│            │                                │                          │          │
│            │                         ┌──────▼───────────────────────┐  │          │
│            │                         │  Anti-Cheat Service          │  │          │
│            │                         │                              │  │          │
│            │                         │  • Token verification        │  │          │
│            │                         │  • Rate limit check          │  │          │
│            │                         │  • Completion time validate  │  │          │
│            │                         │  • Anomaly detection         │  │          │
│            │                         │  • Pattern analysis          │  │          │
│            │                         └──────┬───────────────────────┘  │          │
│            │                                │                          │          │
│     ┌──────▼────────────────────────────────▼───────────────────────┐ │          │
│     │              WebSocket Server (Socket.io)                     │ │          │
│     │                                                                │ │          │
│     │  • Manage connections                                         │◄┼──────────┘
│     │  • Room management (leaderboard room)                         │ │
│     │  • Broadcast score updates                                    │ │
│     │  • Handle disconnections                                      │ │
│     └──────┬──────────────────────────┬─────────────────────────────┘ │
│            │                          │                               │
└────────────┼──────────────────────────┼───────────────────────────────┘
             │                          │
        ┌────▼────┐              ┌──────▼──────┐
        │         │              │             │
┌───────▼────────┐│      ┌───────▼────────────┐│
│   PostgreSQL   ││      │      Redis         ││
│   Database     ││      │      Cache         ││
│                │┘      │                    │┘
│  • Users       │       │  • Leaderboard     │
│  • Scores      │       │  • Rate limits     │
│  • Tokens      │       │  • Session store   │
│  • History     │       │  • Pub/Sub         │
└────────────────┘       └────────────────────┘
```

---

## Flow 1: User Initiates and Completes Action (Full Security Flow)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │     │   API   │     │  Auth   │     │Anti-Cheat│    │Database │     │WebSocket│
│ Browser │     │ Server  │     │ Service │     │ Service  │    │         │     │ Server  │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬─────┘    └────┬────┘     └────┬────┘
     │               │               │               │               │               │
     │ ┌──────────────────────────────────────────────────────────────────────────┐ │
     │ │ PHASE 1: USER AUTHENTICATION                                             │ │
     │ └──────────────────────────────────────────────────────────────────────────┘ │
     │               │               │               │               │               │
     │ POST /auth/login              │               │               │               │
     ├──────────────>│               │               │               │               │
     │ {username,pwd}│               │               │               │               │
     │               │               │               │               │               │
     │               │ Verify credentials            │               │               │
     │               ├──────────────>│               │               │               │
     │               │               │               │               │               │
     │               │               │ Query user    │               │               │
     │               │               ├──────────────────────────────>│               │
     │               │               │               │               │               │
     │               │               │ User data     │               │               │
     │               │               │<──────────────────────────────┤               │
     │               │               │               │               │               │
     │               │ JWT Token     │               │               │               │
     │               │<──────────────┤               │               │               │
     │               │               │               │               │               │
     │ 200 OK + JWT  │               │               │               │               │
     │<──────────────┤               │               │               │               │
     │               │               │               │               │               │
     │ Store JWT in localStorage     │               │               │               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ ┌──────────────────────────────────────────────────────────────────────────┐ │
     │ │ PHASE 2: REQUEST ACTION TOKEN (Before Action Starts)                     │ │
     │ └──────────────────────────────────────────────────────────────────────────┘ │
     │               │               │               │               │               │
     │ POST /actions/request         │               │               │               │
     ├──────────────>│               │               │               │               │
     │ + JWT Token   │               │               │               │               │
     │ + actionType  │               │               │               │               │
     │               │               │               │               │               │
     │               │ Verify JWT    │               │               │               │
     │               ├──────────────>│               │               │               │
     │               │               │               │               │               │
     │               │ Valid ✓       │               │               │               │
     │               │<──────────────┤               │               │               │
     │               │               │               │               │               │
     │               │ Check rate limits             │               │               │
     │               ├──────────────────────────────>│               │               │
     │               │               │               │               │               │
     │               │ Rate OK ✓     │               │               │               │
     │               │<──────────────────────────────┤               │               │
     │               │               │               │               │               │
     │               │ Generate Action Token         │               │               │
     │               │ {                             │               │               │
     │               │   userId,                     │               │               │
     │               │   actionType,                 │               │               │
     │               │   timestamp,                  │               │               │
     │               │   nonce,                      │               │               │
     │               │   signature                   │               │               │
     │               │ }                             │               │               │
     │               │ Encrypt with server secret    │               │               │
     │               │               │               │               │               │
     │               │ Store token hash in DB        │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │ 200 OK        │               │               │               │               │
     │ {actionToken, │               │               │               │               │
     │  expiresAt}   │               │               │               │               │
     │<──────────────┤               │               │               │               │
     │               │               │               │               │               │
     │ Store actionToken             │               │               │               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ ┌──────────────────────────────────────────────────────────────────────────┐ │
     │ │ PHASE 3: USER COMPLETES ACTION (Client-side gameplay/activity)           │ │
     │ └──────────────────────────────────────────────────────────────────────────┘ │
     │               │               │               │               │               │
     │ User plays game/              │               │               │               │
     │ completes activity            │               │               │               │
     │ (5-60 seconds)                │               │               │               │
     │               │               │               │               │               │
     │ Calculate proof:              │               │               │               │
     │ - completionTime              │               │               │               │
     │ - checksum                    │               │               │               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ ┌──────────────────────────────────────────────────────────────────────────┐ │
     │ │ PHASE 4: SUBMIT COMPLETION & UPDATE SCORE (Critical Security Phase)      │ │
     │ └──────────────────────────────────────────────────────────────────────────┘ │
     │               │               │               │               │               │
     │ POST /actions/complete        │               │               │               │
     ├──────────────>│               │               │               │               │
     │ + JWT Token   │               │               │               │               │
     │ + actionToken │               │               │               │               │
     │ + proof       │               │               │               │               │
     │               │               │               │               │               │
     │               │ Verify JWT    │               │               │               │
     │               ├──────────────>│               │               │               │
     │               │               │               │               │               │
     │               │ Valid ✓       │               │               │               │
     │               │<──────────────┤               │               │               │
     │               │               │               │               │               │
     │               │ ┌─────────────────────────────────────────┐  │               │
     │               │ │ SECURITY CHECK 1: Validate Action Token │  │               │
     │               │ └─────────────────────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │ Query token hash              │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ Token record  │               │               │               │
     │               │<──────────────────────────────────────────────┤               │
     │               │               │               │               │               │
     │               │ Decrypt & verify token:       │               │               │
     │               │ ✓ Signature valid             │               │               │
     │               │ ✓ Not expired (<5 min)        │               │               │
     │               │ ✓ Not used before             │               │               │
     │               │ ✓ Matches user ID             │               │               │
     │               │               │               │               │               │
     │               │ ┌─────────────────────────────────────────┐  │               │
     │               │ │ SECURITY CHECK 2: Anti-Cheat Validation │  │               │
     │               │ └─────────────────────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │ Run anti-cheat checks         │               │               │
     │               ├──────────────────────────────>│               │               │
     │               │               │               │               │               │
     │               │               │  ┌────────────────────────┐  │               │
     │               │               │  │ Rate Limiting Check    │  │               │
     │               │               │  │ ✓ <10 actions/min      │  │               │
     │               │               │  │ ✓ <100 actions/hour    │  │               │
     │               │               │  │ ✓ <500 actions/day     │  │               │
     │               │               │  └────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │               │  ┌────────────────────────┐  │               │
     │               │               │  │ Completion Time Check  │  │               │
     │               │               │  │ ✓ >1 second (min)      │  │               │
     │               │               │  │ ✓ <5 minutes (max)     │  │               │
     │               │               │  └────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │               │  ┌────────────────────────┐  │               │
     │               │               │  │ Checksum Validation    │  │               │
     │               │               │  │ ✓ Calculate expected   │  │               │
     │               │               │  │ ✓ Compare with proof   │  │               │
     │               │               │  └────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │               │  ┌────────────────────────┐  │               │
     │               │               │  │ Anomaly Detection      │  │               │
     │               │               │  │ ✓ Pattern analysis     │  │               │
     │               │               │  │ ✓ Score velocity check │  │               │
     │               │               │  │ ✓ No bot behavior      │  │               │
     │               │               │  └────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │ All checks passed ✓           │               │               │
     │               │<──────────────────────────────┤               │               │
     │               │               │               │               │               │
     │               │ ┌─────────────────────────────────────────┐  │               │
     │               │ │ SECURITY CHECK 3: Atomic Score Update   │  │               │
     │               │ └─────────────────────────────────────────┘  │               │
     │               │               │               │               │               │
     │               │ BEGIN TRANSACTION             │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ Mark token as used            │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ Update user score             │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ Insert score history          │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ COMMIT TRANSACTION            │               │               │
     │               ├──────────────────────────────────────────────>│               │
     │               │               │               │               │               │
     │               │ Updated user data             │               │               │
     │               │<──────────────────────────────────────────────┤               │
     │               │               │               │               │               │
     │               │ Update Redis leaderboard cache│               │               │
     │               │ ZADD leaderboard score userId │               │               │
     │               │               │               │               │               │
     │ 200 OK        │               │               │               │               │
     │ {newScore,    │               │               │               │               │
     │  scoreIncr,   │               │               │               │               │
     │  rank}        │               │               │               │               │
     │<──────────────┤               │               │               │               │
     │               │               │               │               │               │
     │ Update UI     │               │               │               │               │
     │ Show +100 pts │               │               │               │               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ ┌──────────────────────────────────────────────────────────────────────────┐ │
     │ │ PHASE 5: REAL-TIME BROADCAST TO ALL CONNECTED CLIENTS                    │ │
     │ └──────────────────────────────────────────────────────────────────────────┘ │
     │               │               │               │               │               │
     │               │ Broadcast leaderboard update  │               │               │
     │               ├──────────────────────────────────────────────────────────────>│
     │               │               │               │               │               │
     │               │               │               │               │  Emit to room │
     │               │               │               │               │  "leaderboard"│
     │               │               │               │               │               │
     │ WSS: leaderboard:update       │               │               │               │
     │<──────────────────────────────────────────────────────────────────────────────┤
     │ {leaderboard:[...],           │               │               │               │
     │  updatedAt}   │               │               │               │               │
     │               │               │               │               │               │
     │ Update scoreboard             │               │               │               │
     │ UI in real-time               │               │               │               │
     │ - Smooth animations           │               │               │               │
     │ - Rank changes                │               │               │               │
     │               │               │               │               │               │
     │ ✓ COMPLETE    │               │               │               │               │
     │               │               │               │               │               │
```

---

## Flow 2: Real-Time Leaderboard Updates (WebSocket)

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Client A │         │ Client B │         │WebSocket │         │  Redis   │
│ (Rank 5) │         │ (Rank 8) │         │  Server  │         │  Cache   │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ Connect WSS        │                    │                    │
     ├───────────────────────────────────────>│                    │
     │ + JWT Token        │                    │                    │
     │                    │                    │                    │
     │                    │ Verify JWT         │                    │
     │                    │                    │                    │
     │ Connected ✓        │                    │                    │
     │<───────────────────────────────────────┤                    │
     │                    │                    │                    │
     │ Join room "leaderboard"                │                    │
     │                    │                    │                    │
     │                    │ Connect WSS        │                    │
     │                    ├───────────────────>│                    │
     │                    │ + JWT Token        │                    │
     │                    │                    │                    │
     │                    │ Connected ✓        │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │                    │ Join room "leaderboard"                │
     │                    │                    │                    │
     │ leaderboard:initial│                    │                    │
     │ (current top 10)   │                    │ Get from cache     │
     │<───────────────────────────────────────┤<───────────────────┤
     │                    │                    │                    │
     │                    │ leaderboard:initial│                    │
     │                    │ (current top 10)   │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │                    │                    │                    │
     ├─────────────────────────────────────────────────────────────┤
     │         USER COMPLETES ACTION (Score Updated)               │
     ├─────────────────────────────────────────────────────────────┤
     │                    │                    │                    │
     │                    │                    │ Score updated      │
     │                    │                    │ Leaderboard changed│
     │                    │                    │                    │
     │                    │                    │ Broadcast to room  │
     │                    │                    │ "leaderboard"      │
     │                    │                    │                    │
     │ leaderboard:update │                    │                    │
     │ {leaderboard:[...]}│                    │                    │
     │<───────────────────────────────────────┤                    │
     │                    │                    │                    │
     │                    │ leaderboard:update │                    │
     │                    │ {leaderboard:[...]}│                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ Update UI          │                    │                    │
     │ - New rank 4!      │                    │                    │
     │ - Animate change   │ Update UI          │                    │
     │                    │ - Still rank 8     │                    │
     │                    │                    │                    │
     │                    │                    │                    │
     │ Heartbeat          │                    │                    │
     ├───────────────────────────────────────>│                    │
     │ ping               │                    │                    │
     │                    │                    │                    │
     │ pong               │                    │                    │
     │<───────────────────────────────────────┤                    │
     │                    │                    │                    │
```

---

## Flow 3: Security Breach Attempt (Prevented)

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Malicious│         │   API    │         │Anti-Cheat│         │Database  │
│  Client  │         │  Server  │         │  Service │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ ┌────────────────────────────────────────────────────────┐  │
     │ │ ATTACK 1: Token Replay Attack                          │  │
     │ └────────────────────────────────────────────────────────┘  │
     │                    │                    │                    │
     │ POST /actions/complete                 │                    │
     ├───────────────────>│                    │                    │
     │ + OLD actionToken  │                    │                    │
     │ (already used)     │                    │                    │
     │                    │                    │                    │
     │                    │ Check token in DB  │                    │
     │                    ├───────────────────────────────────────>│
     │                    │                    │                    │
     │                    │ Token marked as used!                  │
     │                    │<───────────────────────────────────────┤
     │                    │                    │                    │
     │ 400 Bad Request    │                    │                    │
     │ TOKEN_ALREADY_USED │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ ✗ ATTACK BLOCKED ✗ │                    │                    │
     │                    │                    │                    │
     │                    │                    │                    │
     │ ┌────────────────────────────────────────────────────────┐  │
     │ │ ATTACK 2: Rapid-Fire Actions (Rate Limit Exceeded)    │  │
     │ └────────────────────────────────────────────────────────┘  │
     │                    │                    │                    │
     │ POST /actions/complete (11th in 1 min) │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ Check rate limits  │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │ Query Redis        │
     │                    │                    │ User actions count │
     │                    │                    │ in last minute: 11 │
     │                    │                    │                    │
     │                    │ RATE LIMIT EXCEEDED│                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ 429 Too Many Requests                   │                    │
     │ Retry after 60s    │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ ✗ ATTACK BLOCKED ✗ │                    │                    │
     │                    │                    │                    │
     │                    │                    │                    │
     │ ┌────────────────────────────────────────────────────────┐  │
     │ │ ATTACK 3: Tampered Completion Time                     │  │
     │ └────────────────────────────────────────────────────────┘  │
     │                    │                    │                    │
     │ POST /actions/complete                 │                    │
     ├───────────────────>│                    │                    │
     │ + valid token      │                    │                    │
     │ + completionTime:  │                    │                    │
     │   100ms (too fast!)│                    │                    │
     │                    │                    │                    │
     │                    │ Validate completion│                    │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │     ┌──────────────────────────┐        │
     │                    │     │ MIN_TIME = 1000ms        │        │
     │                    │     │ MAX_TIME = 300000ms      │        │
     │                    │     │                          │        │
     │                    │     │ 100ms < MIN_TIME         │        │
     │                    │     │ SUSPICIOUS!              │        │
     │                    │     └──────────────────────────┘        │
     │                    │                    │                    │
     │                    │ INVALID_COMPLETION │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │                    │ Log suspicious activity                │
     │                    ├───────────────────────────────────────>│
     │                    │                    │                    │
     │ 400 Bad Request    │                    │                    │
     │ SUSPICIOUS_ACTIVITY│                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ ✗ ATTACK BLOCKED ✗ │                    │                    │
     │                    │                    │                    │
     │ Account flagged    │                    │                    │
     │ for review         │                    │                    │
     │                    │                    │                    │
```

---

## System State Diagram

```
                    ┌──────────────────────┐
                    │   INITIAL STATE      │
                    │   User not logged in │
                    └──────────┬───────────┘
                               │
                               │ Login
                               ▼
                    ┌──────────────────────┐
                    │   AUTHENTICATED      │
                    │   JWT Token valid    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              │ Request        │                │ View
              │ Action Token   │                │ Leaderboard
              │                │                │
              ▼                │                ▼
   ┌────────────────────┐     │     ┌────────────────────┐
   │   ACTION PENDING   │     │     │   VIEWING          │
   │   Token issued     │     │     │   Leaderboard      │
   │   Expires in 5min  │     │     └────────────────────┘
   └────────┬───────────┘     │
            │                 │
            │ Complete        │
            │ Action          │
            │                 │
            ▼                 │
   ┌────────────────────┐     │
   │   VALIDATING       │     │
   │   Anti-cheat checks│     │
   └────────┬───────────┘     │
            │                 │
       ┌────┴────┐            │
       │         │            │
    Valid     Invalid         │
       │         │            │
       ▼         ▼            │
   ┌───────┐ ┌───────┐       │
   │SUCCESS│ │BLOCKED│       │
   │Score  │ │Reject │       │
   │Updated│ │Request│       │
   └───┬───┘ └───────┘       │
       │                     │
       │ Broadcast           │
       │ Update              │
       │                     │
       ▼                     │
   ┌────────────────────┐    │
   │ LEADERBOARD UPDATED│    │
   │ All clients notified   │
   └────────────────────┘    │
       │                     │
       └─────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │   AUTHENTICATED      │
   │   Ready for next     │
   │   action             │
   └──────────────────────┘
```

---

## Caching Strategy Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────┘

GET /leaderboard
      │
      ▼
┌─────────────────┐
│ API Server      │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Redis  │ ◄──── Check cache (Key: "leaderboard:top10")
    │ Cache  │
    └───┬────┘
        │
   ┌────┴─────┐
   │          │
 CACHE      CACHE
  HIT       MISS
   │          │
   │          ▼
   │    ┌─────────────┐
   │    │ PostgreSQL  │ ◄──── Query database
   │    │  Database   │       SELECT * FROM users
   │    └──────┬──────┘       ORDER BY score DESC
   │           │               LIMIT 10
   │           │
   │           ▼
   │    ┌─────────────┐
   │    │   Cache     │ ◄──── Store in Redis
   │    │   Result    │       SETEX leaderboard:top10 5
   │    └──────┬──────┘       (5 seconds TTL)
   │           │
   └───────────┤
               │
               ▼
         ┌─────────────┐
         │   Return    │
         │   Response  │
         └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CACHE INVALIDATION                          │
└─────────────────────────────────────────────────────────────────┘

Score Update Occurs
      │
      ▼
┌─────────────────┐
│ Update Database │
│ users.score     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Redis    │
│ Sorted Set      │
│ ZADD leaderboard│
│      score userId
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Invalidate Cache│
│ DEL leaderboard │
│     :top10      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Broadcast Update│
│ via WebSocket   │
└─────────────────┘
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ARCHITECTURE                    │
└────────────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │  CloudFlare  │
                          │     CDN      │
                          │   + DDoS     │
                          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │     AWS      │
                          │ Application  │
                          │Load Balancer │
                          └──────┬───────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
          ┌──────▼─────┐  ┌──────▼─────┐ ┌──────▼─────┐
          │   API-1    │  │   API-2    │ │   API-3    │
          │  (Node.js) │  │  (Node.js) │ │  (Node.js) │
          │   Docker   │  │   Docker   │ │   Docker   │
          └──────┬─────┘  └──────┬─────┘ └──────┬─────┘
                 │               │               │
                 └───────────────┼───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼────────┐     ┌────────▼──────┐      ┌───────▼─────────┐
    │ PostgreSQL  │     │     Redis     │      │   WebSocket     │
    │   Primary   │     │    Cluster    │      │     Server      │
    │             │     │               │      │   (Socket.io)   │
    └──────┬──────┘     │ • Cache       │      └─────────────────┘
           │            │ • Sessions    │
           │            │ • Rate Limits │
    ┌──────▼──────┐     │ • Pub/Sub     │
    │ PostgreSQL  │     └───────────────┘
    │   Replica   │
    │  (Read-only)│
    └─────────────┘
```

This comprehensive execution flow documentation provides the backend engineering team with clear visual representations of all critical system flows, security mechanisms, and architectural decisions.

