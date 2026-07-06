# Execution Flow

## Login and score update

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Store

    C->>A: POST /auth/login
    A->>S: verify credentials
    A-->>C: JWT

    C->>A: POST /api/actions/request (Bearer JWT)
    A->>S: save pending action
    A-->>C: actionToken + actionId

    Note over C: user completes level

    C->>A: POST /api/actions/complete (token + proof)
    A->>S: validate token, rate limit, timing
    A->>S: increment score
    A-->>C: newScore + rank
    A-->>C: WSS board:changed
```

## Anti-cheat checks (complete action)

1. JWT valid and matches token subject
2. Action token not expired or reused
3. Rate limit not exceeded
4. Completion time within allowed range
5. Score increment computed server-side
