# Use Debian-based image instead of Alpine for better OpenSSL compatibility
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Install Prisma CLI for migrations
RUN npm install prisma --save-dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# Start the application
CMD ["npm", "start"]