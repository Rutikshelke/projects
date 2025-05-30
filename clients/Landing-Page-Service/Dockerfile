# -------------------------
# Stage 1: Build the Vite app
# -------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all source files and build the app
COPY . .
RUN npm run build

# -------------------------
# Stage 2: Serve with NGINX
# -------------------------
FROM nginx:alpine

# Clean default nginx html directory
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom NGINX config (you must create nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
