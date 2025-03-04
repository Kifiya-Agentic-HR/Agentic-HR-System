FROM node:18-alpine

WORKDIR /job-portal
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build
CMD ["npm", "run", "dev"]