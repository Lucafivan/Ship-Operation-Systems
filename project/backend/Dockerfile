FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=run.py

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

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh
ENTRYPOINT ["sh", "/entrypoint.sh"]
CMD ["python", "run.py"]