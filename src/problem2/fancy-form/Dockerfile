FROM node:20-alpine AS builder

# Set build-time variables
ARG VITE_API_ENDPOINT=https://interview.switcheo.com/prices.json

# Set environment variables for Vite
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
