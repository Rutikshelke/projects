# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY node_modules ../../node_modules
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Install nodemon globally if needed
RUN npm install -g nodemon

# Copy the rest of your code
COPY . .

# Expose port (adjust as needed)
EXPOSE 4000


CMD ["npm", "run", "dev"]
