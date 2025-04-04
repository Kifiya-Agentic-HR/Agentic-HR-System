FROM node:18-alpine

WORKDIR /job-portal

# Declare build argument for job_service_frontend
ARG NEXT_PUBLIC_BASE_API_URL

# Optionally expose it as an environment variable during build
ENV NEXT_PUBLIC_BASE_API_URL=${NEXT_PUBLIC_BASE_API_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_BASE_API_URL}

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]