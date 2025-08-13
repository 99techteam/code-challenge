## Modules
- HTTP API Layer – Handles incoming REST requests, validates inputs (Zod/DTOs), and maps to domain services.
- Domain Services – Encapsulate business logic, ensure data integrity, and orchestrate between APIs and storage.
- Event Processing – Consumes Kafka events, updates projections (e.g., Redis leaderboard), and triggers notifications.
- Persistence Layer – Handles database operations and caching.
- Monitoring & Observability – Integrates with Grafana + OpenTelemetry for metrics and tracing.

## Technical Considerations
### Scalability
1. As a optimized way to handle heavy load on reading the leaderboard, we used Redis and SortedSet data structure, however this comes with a cost, we'll face some issue with maintain the data, to make sure that it'll stay even the Redis service goes down/restart, to deal with this problem, I suggest we'll use Event Sourcing pattern with RDB and WAL backup to make sure data is still there after server restarts.

- Why event sourcing: We have 2 different database, the primary database which is the single source of truth, redis with SortedSet for leaderboard optimizedly read, and in order to achieve great write performance 2PC might not be an option. And Redis data can be lost after each restart, so we have to have a way to backup this data, while we can still combines RDB backup intervally with WAL backup, in case those two is lost, we can still rely on the event sourcing to replay those event from event store, and retrieve the leaderboard data again.
- As we're using Kafka as an message broker, we can also use it as a event store for this problem.


2. The event emmitting performance issue, to live update the leaderboard, we might think that it's necessary to emit event whenever we update the leaderboard using `ZINCR`, while this works, it may produces serios performance issue, imagine we have millions of user(call this `n`) watching of the leaderboard, each event will produces n message each time we use `ZINCR`, that isane. To solve this problem we might need to think of:
- Create a difference cache to store the leaderboard, whenever a `ZINCR` is executed agaist the leaderboard, we check the result of the leaderboard and the cached one, if they're different, we emit the message to connected user who are watching the leaderboard. This reduce significant amount of event is emiit.
- While above solution solve the event is emitted to the client, there's anothing we might need to think of, which is the checking step agaist the cache whenever `ZINCR` is used, if `ZINCR` is used frequently, for example 1000 times per second, we need to fetch data from leaderboard, cache, performs checking mechanism for 1000 times also, that is not very optimized. So to solve this issue, we might need to sacrify a bit of live update, it's to use interval time. We will not performs update, emit event base on the `ZINCR` command anymore, but rather a hard-coded amount of time, for example, every 5 seconds, check the leaderboard data agaist the cache, if they're different, emit the message to all client who are watching the leaderboard.

