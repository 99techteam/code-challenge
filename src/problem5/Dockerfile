FROM node:22-alpine3.20 as builder
WORKDIR /app
RUN apk update && apk add --no-cache gcc musl-dev git
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn prisma generate
RUN yarn build

# Deployment environment
# ----------------------
FROM node:22-alpine3.20
WORKDIR /app
RUN apk update && apk add --no-cache curl

COPY --from=builder ./app/prisma .
COPY --from=builder ./app/dist/apps/api-server .
COPY --from=builder ./app/apps/api-server/run.sh .
RUN yarn install --production
RUN yarn add prisma@6.0.1
RUN yarn prisma generate

ENTRYPOINT sh run.sh
