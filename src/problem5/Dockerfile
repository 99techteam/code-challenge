FROM oven/bun:1.3.11-alpine

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

COPY tsconfig.json ./
COPY src ./src

RUN mkdir -p /app/data
ENV DB_PATH=/app/data/app.db
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["bun", "run", "src/index.ts"]
