FROM node:18-alpine

WORKDIR /CMS-frontend

# Declare build arguments for cms_frontend
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GEMINI_API_KEY

# Optionally set these as environment variables for the build process
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_GEMINI_API_KEY=${NEXT_PUBLIC_GEMINI_API_KEY}

COPY package*.json ./ 
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]