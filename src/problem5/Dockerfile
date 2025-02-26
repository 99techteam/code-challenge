# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:latest

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy application code.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]