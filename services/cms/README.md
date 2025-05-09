# CMS Service

Provides a robust Content Management System (CMS) for the Agentic HR Platform. This service is organized into two main components:

- **backend/**: A NestJS REST API for managing content models, authentication, and data persistence.
- **frontend/**: A Next.js application for content editors and administrators to create, update, and publish content.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup & Installation](#setup--installation)
3. [Running the Service](#running-the-service)
4. [Docker & Deployment](#docker--deployment)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Directory Structure](#directory-structure)
8. [Contributing](#contributing)

---

## Prerequisites
- Node.js v18+ and npm or Yarn
- Docker & Docker Compose (optional for containerized setup)
- A running database (PostgreSQL, MongoDB, etc.)

## Setup & Installation

### Backend
```bash
cd services/cms/backend
npm install
cp .env.example .env
# Edit .env to configure your DATABASE_URL, JWT_SECRET, and other variables
```

### Frontend
```bash
cd services/cms/frontend
npm install
cp .env.local.example .env.local
# Edit .env.local to configure NEXT_PUBLIC_API_URL
```

## Running the Service

### Backend (development)
```bash
cd services/cms/backend
npm run start:dev
```

### Frontend (development)
```bash
cd services/cms/frontend
npm run dev
```

Access the frontend at http://localhost:3000 and the API at http://localhost:4000 (or your configured backend port).

## Docker & Deployment

You can build and run both components via Docker Compose:
```bash
docker-compose up --build cms-backend cms-frontend
```

## Configuration
- Backend `.env` variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
- Frontend `.env.local` variables:
  - `NEXT_PUBLIC_API_URL`

## Testing

### Backend
```bash
npm run test      # unit tests
npm run test:e2e  # end-to-end tests
```

### Frontend
```bash
npm run test
```

## Directory Structure
```
services/cms/
├── backend/
│   ├── src/       # NestJS application code
│   └── test/      # Integration & e2e tests
└── frontend/
    ├── app/       # Next.js app directory
    └── src/       # React components & pages
```

## Contributing
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
