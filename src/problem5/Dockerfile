# Base stage
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
COPY . .

# Development stage
FROM base AS dev
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# Production build stage
FROM base AS build
RUN pnpm install --prod=false
RUN pnpm run build
RUN pnpm prune --prod

# Production stage
FROM node:22-alpine AS prod
WORKDIR /usr/src/app
RUN npm install -g pnpm

# Copy built application and production dependencies
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]