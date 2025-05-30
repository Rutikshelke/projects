# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Run service
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
