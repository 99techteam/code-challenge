# Use official Node.js 18 image
FROM node:18

# Set working directory
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Install app dependencies
COPY package*.json ./
# RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Generate Prima client & build the application
RUN npx prisma generate && npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
