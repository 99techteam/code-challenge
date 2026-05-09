# syntax=docker/dockerfile:1

# Build the Problem 2 (Vite + React) static bundle.
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json vitest.config.ts ./
COPY src ./src

RUN npm run build:problem2

# Serve prebuilt assets with nginx.
FROM nginx:1.27-alpine AS runtime

COPY src/problem2/docker/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/problem2-with-react /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
