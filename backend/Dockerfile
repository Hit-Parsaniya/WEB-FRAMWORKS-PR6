# ==============================================================================
# Dockerfile for Node.js / Express Backend (Practical 11 - Step 2)
# ==============================================================================

# Base image using official LTS Node.js 18
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install application dependencies inside the container
RUN npm install

# Copy application source code into container
COPY . .

# Expose backend port 5000 (documentation / metadata)
EXPOSE 5000

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start Express server
CMD ["node", "server.js"]
