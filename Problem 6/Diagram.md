flowchart TD
subgraph Client
A[User Action] --> B[Client App]
B --> C[Score Update Request]
end

    subgraph API Gateway
        C --> D[Authentication & Rate Limiting]
        D --> E{Valid Request?}
        E -->|No| F[Return Error]
        E -->|Yes| G[Route to Score API]
    end

    subgraph "Score API Module"
        G --> H[Input Validation]
        H --> I[Verify Action with Action Service]
        I --> J{Action Valid?}
        J -->|No| K[Return Error]
        J -->|Yes| L[Calculate New Score]
        L --> M[Update Score in Database]
        M --> N[Update Leaderboard Cache]
        N --> O[Send WebSocket Notification]
        O --> P[Return Success Response]
    end

    subgraph WebSocket Server
        O -.-> Q[Broadcast Update]
        Q -.-> R[Connected Clients]
    end

    subgraph Dependencies
        I -.-> S[Action Verification Service]
        M -.-> T[Database]
        N -.-> U[Redis Cache]
    end

    R -.-> V[Update UI Leaderboard]
