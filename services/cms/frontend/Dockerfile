FROM node:18-alpine

WORKDIR /CMS-frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]