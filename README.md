# Agentic HR System 

*An AI-powered recruitment platform, simplified for all.*

Welcome to **Agentic HR System**, a modular, microservices-based recruitment solution that uses multiple AI agents to automate and optimize every stage of hiring.

## Table of Contents
- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Services](#services)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Overview
The Agentic HR System orchestrates dedicated services for job postings, candidate screening, interviewing, notifications, and more. Each service can be developed and deployed independently, enabling flexibility and scalability.

## How It Works
The end-to-end recruitment workflow consists of five stages:

1. **Job Posting & Careers Page**
   - HR staff create and manage job listings via the CMS dashboard.
   - Candidates browse available roles and apply through a public careers portal.

2. **Application Intake & Processing**  
   - Submitted resumes and metadata are enqueued and processed asynchronously.

3. **AI-Powered Candidate Screening**  
   - Screening service analyzes resumes against job requirements, computes match scores, and extracts key insights.

4. **Virtual Interview (AI Chatbot)**  
   - Shortlisted candidates interact with an AI-driven chatbot that simulates an interview and evaluates responses in real time.

5. **Automated Notifications & Emails**  
   - Notification service sends templated emails for application receipts, interview invites, and final decisions.

## Features
- Centralized job management and public careers page
- Asynchronous, queue-based resume processing
- AI-driven screening with detailed score breakdowns
- Interactive interview chatbot powered by LLMs
- Customizable notification templates and multi-channel delivery
- Modular microservices for independent scalability

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Job Service, Notification Service, Screen Service), NestJS (CMS), Flask/Django (Technical Assessment)
- **AI & Orchestration**: Python, crewAI, OpenAI/Gemini
- **Data Stores**: MongoDB, PostgreSQL
- **Messaging & Queue**: RabbitMQ
- **Containerization**: Docker, Docker Compose

## Project Structure
```text
Agentic-HR-System
├── services
│   ├── cms               # Content management service for job postings
│   ├── interview_ai      # Multi-agent orchestration for interviews
│   ├── job_service       # Job posting & application API & UI
│   ├── screen_service    # Resume screening microservice
│   ├── notification      # Email notification microservice
│   └── technical_assessment # Coding challenge & assessment service
├── docker-compose.yaml   # Orchestrate services and databases
├── assets                # Logos, architecture diagrams, references
├── data                  # Local MongoDB data files
├── package.json          # Root definitions (if any)
└── README.md             # This file
```

## Services
- **CMS**: NestJS app to create/edit/delete job postings
- **Interview AI**: Python-based crewAI agents for parsing resumes, generating questions, simulating interviews, and reporting
- **Job Service**: FastAPI backend + Next.js frontend for jobs and applications
- **Screen Service**: Consumes application messages, AI-screens resumes, stores results in MongoDB
- **Notification**: FastAPI service for rendering email templates and sending via SMTP
- **Technical Assessment**: Web-based coding challenge platform

## Getting Started
### Prerequisites
- Git
- Node.js (>=16.x) & npm or Yarn
- Python 3.10+
- Docker & Docker Compose (for containerized setup)
- RabbitMQ & MongoDB (or use Docker Compose)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Kifiya-Agentic-HR/Agentic-HR-System.git
   cd Agentic-HR-System
   ```
2. Copy environment templates and configure variables:
   ```bash
   cp .env.example .env
   ```
3. Make sure to check the .env to fill everything.

### Configuration
- Each service has its own `.env` file—configure connection URLs, API keys, and ports accordingly.
- Global settings can be centralized or overridden per-service.

### Running Locally with Docker Compose
Start all services and dependencies:
```bash
docker-compose up --build
```
- Careers page: http://localhost:3000/careers
- Admin CMS: http://localhost:3000/admin
- API docs (FastAPI): http://localhost:8000/docs

### Running Services Individually
Example: Job Service
```bash
cd services/job_service/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
``` 

## Deployment
- Use `docker-compose` for staging/production with proper environment variables.
- CI/CD pipelines can build and push Docker images per-directory.
- Consider Kubernetes for large-scale deployments.

## Testing
- Unit/integration tests reside in each service's `tests/` folder.
- Example: run pytest in a service:
  ```bash
  cd services/notification
  pytest -q
  ```

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/xyz`
3. Commit your changes: `git commit -m "Add XYZ feature"`
4. Push: `git push origin feature/xyz`
5. Open a pull request

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
