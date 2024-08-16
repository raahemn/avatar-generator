# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port for the application
EXPOSE 8080

# Command to run the app
CMD ["node", "dist/index.js"]
