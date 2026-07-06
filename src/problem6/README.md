# Problem 6: Real-Time Scoreboard API

Backend specification for a live top-10 scoreboard with authenticated score updates and anti-cheat controls.

## Overview

Clients authenticate with JWT, request short-lived action tokens before gameplay, then submit completion proofs to earn points. The server validates tokens, enforces rate limits, and pushes leaderboard changes over WebSocket.

### Requirements

1. Display top 10 users ranked by score
2. Push live updates without page refresh
3. Increment scores only through verified server actions
4. Block unauthorized or replayed submissions

### Recommended stack

- Node.js + TypeScript, Express
- PostgreSQL or Redis for leaderboard storage
- Socket.io or SSE for realtime
- JWT for session auth

## Architecture

```
Client (UI + game actions)
    |  HTTPS / WSS
    v
API Gateway
    |-- REST (auth, actions, leaderboard)
    |-- WebSocket (live board)
    v
Application
    |-- Auth middleware
    |-- Action token service
    |-- Anti-cheat validation
    |-- Score / rank service
    v
Database + cache
```

See [EXECUTION_FLOW_DIAGRAM.md](./EXECUTION_FLOW_DIAGRAM.md) for request flows.

## API Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Returns JWT |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Invalidate session |

### Actions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/actions/request` | Issue action token (auth required) |
| POST | `/api/actions/complete` | Submit proof + token (auth required) |

### Leaderboard & profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Top N players (`?limit=10`) |
| GET | `/api/users/me/score` | Current user score + rank |
| WSS | `/socket.io` | Live board events |

### WebSocket events

| Event | Direction | Payload |
|-------|-----------|---------|
| `board:snapshot` | server → client | Initial top 10 |
| `board:changed` | server → client | Updated top 10 |
| `player:scored` | server → client | Personal score delta |

## Security

1. **JWT** on all mutating routes
2. **Action tokens** — single-use, short TTL, bound to user + action type
3. **Rate limits** — per user/minute (demo: 10/min)
4. **Completion validation** — reject implausible timing (demo: 1s–300s)
5. **Server-side scoring** — client never sends raw score deltas

## Data models

```typescript
interface PlayerProfile {
  id: string;
  username: string;
  score: number;
  rank?: number;
}

interface PendingAction {
  actionToken: string;
  actionId: string;
  expiresAt: string;
}
```

Type definitions and constants: [`src/index.ts`](./src/index.ts).

## Demo

A working in-memory demo lives in [`demo/`](./demo/).

```bash
cd src/problem6/demo
npm install
npm start          # http://localhost:3000
npm test
```

Open `demo/client.html` in a browser. Seeded players: Minh, Lan, Huy, … (password: `pass123`).

Demo layout:

```
demo/
├── app.js              # Express factory
├── server.js           # HTTP + Socket.io entry
├── lib/
│   ├── store.js        # In-memory players
│   ├── auth.js
│   ├── actions.js
│   ├── leaderboard.js
│   └── rateLimiter.js
└── client.html
```

## Implementation order

1. Auth + user model
2. Leaderboard read API
3. Action token issue / redeem
4. Anti-cheat + rate limiting
5. WebSocket broadcast
6. Cache layer + monitoring

## Testing

- Unit tests for token validation and rate limiter
- Integration tests for login → request → complete flow
- Verify replay rejection and sorted leaderboard

Run demo tests: `cd demo && npm test`

## Further reading

- [IMPROVEMENTS_AND_CONSIDERATIONS.md](./IMPROVEMENTS_AND_CONSIDERATIONS.md) — production hardening notes
