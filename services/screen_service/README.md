# Screen Service

The **Screen Service** is a microservice responsible for processing job applications by consuming messages from a RabbitMQ queue, scoring and parsing resumes using AI/ML techniques, and persisting screening results in MongoDB. It plays a critical role in automating the resume screening pipeline, improving hiring efficiency and candidate quality.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Containerization (Docker)](#containerization-docker)
- [Logging & Monitoring](#logging--monitoring)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- Asynchronously consumes application messages from RabbitMQ (`application_queue`).
- Uses AI/ML-powered resume scoring function to compute keyword, vector, and overall scores.
- Persists screening results to MongoDB (`screening_results` collection).
- Supports separate flows for web submissions and AI-driven recommendations.
- Configuration via environment variables, allowing easy deployment across environments.

## Technology Stack

- Python 3.10+
- aio-pika (RabbitMQ client)
- MongoDB
- ThreadPoolExecutor for offloading blocking tasks
- Pydantic or custom models for serialization (in `src/database/model`)

## Prerequisites

- RabbitMQ instance (default URL: `amqp://guest:guest@rabbitmq:5672/`)
- MongoDB instance (default URI: `mongodb://mongodb:27017/hr_db`)
- Python 3.10 or higher

## Installation

1. Clone the repository and navigate to the `screen_service` directory:
   ```bash
   git clone <repo_url>
   cd services/screen_service
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

All configuration options are defined in `config_local.py` and can be overridden via environment variables or a `.env` file:

| Variable          | Default                                              | Description                         |
| ----------------- | ---------------------------------------------------- | ----------------------------------- |
| `RABBITMQ_URL`    | `amqp://guest:guest@rabbitmq:5672/`                  | RabbitMQ connection URL             |
| `MONGODB_URI`     | `mongodb://mongodb:27017/hr_db`                      | MongoDB connection URI              |
| `QUEUE_NAME`      | `application_queue`                                  | Name of the RabbitMQ queue          |
| `UPLOAD_DIR`      | `/shared_volume`                                     | Directory for temporary resume files|
| `GEMINI_API_KEY`  | `None`                                               | Optional LLM API key for parsing    |

Example `.env`:
```
RABBITMQ_URL=amqp://user:pass@localhost:5672/
MONGODB_URI=mongodb://localhost:27017/hr_db
QUEUE_NAME=application_queue
UPLOAD_DIR=/tmp/uploads
GEMINI_API_KEY=your_api_key_here
```

## Running Locally

To start the consumer and process incoming application messages:

```bash
# From services/screen_service
python -m src.rabbitMQ.consumer
```

The service will:
1. Connect to RabbitMQ and listen on the configured queue.
2. Deserialize incoming messages containing job and resume info.
3. Offload resume scoring to a thread pool.
4. Save screening or recommendation results in MongoDB.

## Containerization (Docker)

A Dockerfile (`Dockerfile.consumer`) is provided to build a container image for the service.

### Build Image
```bash
docker build -f Dockerfile.consumer -t screen-service:latest .
```

### Run Container
```bash
docker run --rm \
  -e RABBITMQ_URL=$RABBITMQ_URL \
  -e MONGODB_URI=$MONGODB_URI \
  -e QUEUE_NAME=$QUEUE_NAME \
  -e UPLOAD_DIR=$UPLOAD_DIR \
  -e GEMINI_API_KEY=$GEMINI_API_KEY \
  screen-service:latest
```

## Logging & Monitoring

- Logs are output to STDOUT with `INFO` level by default.
- Use container orchestration logs or centralized logging (e.g., ELK) to aggregate and monitor.

## Troubleshooting

- **Connection errors**: Verify RabbitMQ and MongoDB URLs in env variables.
- **Authentication issues**: Ensure credentials are correct and services are reachable.
- **Malformed messages**: Check message producer is sending valid JSON.

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
