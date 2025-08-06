# ========================
# STAGE 1: Build Stage
# ========================
FROM node:18-alpine AS build

WORKDIR /app

# Copy only package files for faster layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Generate Prisma client for linux-musl
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the TypeScript project
RUN npm run build


# ========================
# STAGE 2: Production Stage
# ========================
FROM node:18-alpine AS prod

WORKDIR /app

# Copy only what's needed from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/.env ./.env
COPY --from=build /app/package.json ./package.json

# Run the built JS code
CMD ["node", "dist/index.js"]
