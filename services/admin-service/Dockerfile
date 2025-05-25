FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
# Copy source code
COPY ../../../libs ./libs/

CMD ["npm", "run", "start"]
