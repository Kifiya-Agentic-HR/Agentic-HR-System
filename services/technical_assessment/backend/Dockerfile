
FROM python:3.9-slim

WORKDIR /app



# Install Python dependencies first
COPY requirements.txt .
RUN pip install -r requirements.txt


# Copy application code
COPY . .

# Create shared volume directory
RUN mkdir -p /shared_volume

EXPOSE 4455

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4455", "--reload", "--log-level", "debug"]
