# Alternative: Dockerfile without nginx (use system nginx instead)
# This serves the static files on a different port for system nginx to proxy to

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with lightweight HTTP server
FROM node:20-alpine

# Install a simple HTTP server
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist /app/dist

# Set working directory
WORKDIR /app

# Expose port 3000 (system nginx will proxy to this)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
