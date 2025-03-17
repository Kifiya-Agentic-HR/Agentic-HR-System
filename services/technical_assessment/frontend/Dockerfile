# services/technical_assessment/frontend/Dockerfile

FROM node:18-alpine

# 1) Set the working directory
WORKDIR /technical_assessment

# 2) Copy over your package files first, then install
COPY package.json package-lock.json ./
RUN npm install

# 3) Copy the rest of your Next.js app source code
COPY . .

# 4) Build the production bundle
RUN npm run build

# 5) Expose your chosen port (4000 in your Compose)
EXPOSE 4000

# 6) Start the Next.js server
CMD ["npm", "start"]
