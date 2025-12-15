# Multi-stage build for optimized production image

# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables (with defaults for auto-build)
ARG VITE_SUPABASE_URL=https://yibxoxqhwhfqsktuwaeq.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpYnhveHFod2hmcXNrdHV3YWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDE0NjgsImV4cCI6MjA4MDc3NzQ2OH0.Dm5KhvYpXnOopeHVpQ_bTPGQ3I57xaUpFcyn2gItrFw
ARG VITE_EVOLUTION_API_URL=https://n8n-evolution.kof6cn.easypanel.host
ARG VITE_EVOLUTION_API_KEY=qwSYwLlijZOh+FaBHrK0tfGzxG6W/J4O

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_EVOLUTION_API_URL=$VITE_EVOLUTION_API_URL
ENV VITE_EVOLUTION_API_KEY=$VITE_EVOLUTION_API_KEY

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
