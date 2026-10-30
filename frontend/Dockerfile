# ==============================================================================
# Multi-Stage Dockerfile for React Frontend (Practical 11 - Step 3 & Supp. Prob 2)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build stage (compiles JSX, CSS, and vendor assets with Vite)
# ------------------------------------------------------------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install development & production dependencies
RUN npm install

# Copy source code and config
COPY . .

# Compile optimized static bundle into /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production runtime stage (reduces final image footprint)
# ------------------------------------------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package metadata and preview configuration
COPY --from=build /app/package*.json ./
COPY --from=build /app/vite.config.js ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Expose Vite preview port 5173
EXPOSE 5173

# Serve production bundle on 0.0.0.0:5173 for Docker container access
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
