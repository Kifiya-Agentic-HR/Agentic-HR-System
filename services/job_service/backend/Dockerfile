
FROM python:3.12-slim


WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    tesseract-ocr \
    poppler-utils \
    libgl1 \
    libmagic1 \
    file \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install NLTK data
RUN python -m nltk.downloader punkt stopwords wordnet omw-1.4
RUN python -c "import nltk; nltk.download('punkt_tab')"

# Copy application code
COPY . .

# Create shared volume directory
RUN mkdir -p /shared_volume


# Set environment variables
ENV TESSERACT_CMD=/usr/bin/tesseract
ENV POPPLER_PATH=/usr/bin
ENV PYTHONUNBUFFERED=1

EXPOSE 9000


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]