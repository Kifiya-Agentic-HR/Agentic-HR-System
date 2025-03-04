FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
