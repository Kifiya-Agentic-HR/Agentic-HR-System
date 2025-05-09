# Job Service

The **Job Service** manages job postings and applicant submissions. It consists of two main components:

1. **Backend API** (Python FastAPI)
2. **Frontend Application** (Next.js)

This README provides detailed information on setup, configuration, usage, and deployment.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Repository Structure](#repository-structure)
- [Backend Setup](#backend-setup)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Backend](#running-the-backend)
  - [API Endpoints](#api-endpoints)
- [Frontend Setup](#frontend-setup)
  - [Installation](#installation-1)
  - [Configuration](#configuration-1)
  - [Running the Frontend](#running-the-frontend)
- [Docker](#docker)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- Create, read, update, and delete job postings
- List and filter jobs by title, location, or skills
- Submit job applications via a form
- API-driven architecture for extensibility
- Responsive frontend UI

## Technology Stack

- **Backend**: FastAPI, Python 3.10+, Pydantic, Uvicorn
- **Database**: MongoDB (via Motor) or PostgreSQL (via SQLAlchemy) configured in `app/database`
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Messaging**: (Optional) Integrations with RabbitMQ or Kafka for async processing

## Prerequisites

- Node.js >=16.x and npm / yarn
- Python 3.10+
- MongoDB or PostgreSQL instance
- (Optional) Docker and Docker Compose

## Repository Structure

```
services/job_service
├── backend
│   ├── app
│   │   ├── database   # DB models & connection
│   │   ├── routes     # API route definitions
│   │   ├── schemas    # Pydantic request/response models
│   │   └── utils      # Helper functions
│   ├── requirements.txt
│   └── main.py        # FastAPI app entrypoint
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages      # Next.js routes
│   │   └── styles
│   ├── package.json
│   └── README.md      # Frontend-specific instructions
└── README.md          # This file
```

## Backend Setup

### Installation

1. Navigate to the backend folder:
   ```bash
   cd services/job_service/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

Environment variables can be set in a `.env` file or your shell:

```
DATABASE_URL=mongodb://localhost:27017/jobs_db  # or SQLALCHEMY_DATABASE_URL for Postgres
PORT=8000
```

### Running the Backend

Start the FastAPI application with Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
```

Visit the OpenAPI docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### API Endpoints

- `GET /jobs` - List all jobs
- `GET /jobs/{job_id}` - Get job details
- `POST /jobs` - Create a new job
- `PUT /jobs/{job_id}` - Update a job
- `DELETE /jobs/{job_id}` - Delete a job
- `POST /applications` - Submit an application with resume and metadata


## Frontend Setup

### Installation

1. Navigate to the frontend folder:
   ```bash
   cd services/job_service/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   # or yarn install
   ```

### Configuration

The frontend reads the backend API base URL from an environment variable. Create a `.env.local` in the frontend root:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Frontend

Start the development server:

```bash
npm run dev
# or yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Docker

A `docker-compose.yaml` can orchestrate both backend, frontend, and database:

```yaml
version: '3.8'
services:
  db:
    image: mongo:6.0
    ports:
      - 27017:27017
  backend:
    build: ./services/job_service/backend
    env_file:
      - ./services/job_service/backend/.env
    ports:
      - 8000:8000
  frontend:
    build: ./services/job_service/frontend
    env_file:
      - ./services/job_service/frontend/.env.local
    ports:
      - 3000:3000
```

Bring up all services:
```bash
docker-compose up --build
```

## Testing

- **Backend**: write tests in `services/job_service/backend/tests` and run with pytest.
- **Frontend**: use Jest and React Testing Library; run `npm run test`.

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit and push: `git commit -m "Add new feature"`
4. Open a pull request

## License

This project is licensed under MIT. See the [LICENSE](../../LICENSE) file for details.
