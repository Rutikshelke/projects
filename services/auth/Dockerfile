FROM node:18-alpine

LABEL Name="fantasy-auth-service" \
      Version="1.0.0" \
      Maintainer="Your Name <your.email@example.com>" \
      Description="Authentication service for Fantasy Stock Market"

WORKDIR /app

COPY services/auth/package.json ./
RUN npm install


# Copy source code
COPY services/auth ./
COPY ../../../libs ./


CMD ["npm", "run", "start"]