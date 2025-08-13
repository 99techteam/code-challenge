
## Description

This project demonstrate CRUD server for resource with a db

## Technologies of choices

- DB manipulation - [kysely](https://kysely.org/), a query builder with fully typesafe, reason that I choose this is that it gives me the ability to performs complex query without sacrify typesafe, generated query is simple, easy to debug and tuning.

- Testing lib - [Vitest](https://vitest.dev/), a testing framework with a focus on simplicity and speed.

- Observerbility - [OpenTelemetry](https://opentelemetry.io/), a distributed tracing and metrics framework, gives me standard metrics and traces. Stack that I use for this is Opentelemetry, grafana stack.

- Logger - [Winston](https://github.com/winstonjs/winston), a logging framework with a focus on modularity and flexibility.

- Design patterns: [Strategy](https://refactoring.guru/design-patterns/strategy), Dependencies Injection, which gives me flexibity of creational, using a component, also makes the codebase extremely easy to test.

- Dependency management - Manually manage the dependency, while aware of existence of some other DI packages like `tsyringe` and `inversifyjs`, I'll prefer to manually manage them, after all the purpose of this is showing capability of my understanding, knowledge of how things works.

- Code quality - [Biome](https://github.com/benjamingr/biome), a code quality tool, gives me ability to write clean, readable, maintainable code, with a focus on type safe.

- Linting - [Biome](https://github.com/benjamingr/biome), a code quality tool, gives me ability to write clean, readable, maintainable code, with a focus on type safe.

- Validation - [Zod](https://github.com/colinhacks/zod), a validation library with a focus on type safe.

- Documentation - [Swagger](https://swagger.io/), a documentation tool with a focus on simplicity, readability and accessibility.


## Project setup

```bash
$ pnpm install
```

## Project Dependencies

```bash
# start database and grafana stack
$ docker-compose up -d
```


## Database migration

```bash
# migrate to latest version
$ pnpm db:migrate

# rollback to previous version
$ pnpm db:rollback


# check migration status
$ pnpm db:status
```

## Compile and run the project

```bash
# watch mode
$ pnpm dev


# build the project
$ pnpm build

# production mode
$ pnpm start
```

## Run tests

```bash
# unit tests
$ pnpm run test


# test with UI
$ pnpm run test:ui
```

## project structure
```bash

.
├── migrations/ # Database migration scripts
├── src/ # Application source code
│ ├── config/ # Configuration files (env, app settings, etc.)
│ ├── constants/ # Application-wide constant values
│ ├── database/ # Database connection, ORM/Query builder setup
│ ├── exceptions/ # Custom error and exception classes
│ ├── logger/ # Logging utilities and configurations
│ ├── middlewares/ # Express or HTTP middlewares
│ ├── modules/ # Feature modules (grouped by domain/business logic)
│ ├── instrumentation.ts # Observability setup (tracing, metrics, etc.)
│ └── main.ts # Application entry point
├── .env.example # Example environment variable definitions
├── biome.json # Biome (linter/formatter) configuration
├── docker-compose.yaml # Docker Compose setup for local development
├── kysely.config.ts # Kysely (SQL query builder) configuration
├── nodemon.json # Nodemon configuration for hot reloading
├── package.json # Project dependencies and scripts
├── pnpm-lock.yaml # Dependency lockfile for pnpm
├── readme.md # Project documentation
├── tsconfig.json # TypeScript compiler configuration
└── vitest.config.ts # Vitest testing framework configuration

```
