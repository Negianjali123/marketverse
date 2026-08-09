FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# clear Install dependencies
RUN npm ci --omit=dev

# Copy all backend source code (config, routes, controllers, etc.)
COPY . .

# Expose backend port
EXPOSE 5000

# Use nodemon to watch for file changes and restart automatically
CMD ["node", "index.js"]