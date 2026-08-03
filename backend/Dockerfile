FROM node:20.15.0

WORKDIR /app

# Install nodemon globally for hot-reloading
RUN npm install -g nodemon

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code (config, routes, controllers, etc.)
COPY . .

# Expose backend port
EXPOSE 5000

# Use nodemon to watch for file changes and restart automatically
CMD [ "npm","run","dev" ]