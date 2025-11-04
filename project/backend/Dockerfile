FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies sistem
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
 && pip install --no-cache-dir -r requirements.txt

# Copy seluruh source code
COPY . .

# Expose port Flask
EXPOSE 5000

CMD ["python", "run.py"]

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]