FROM python:3.11-slim

WORKDIR /app

RUN mkdir -p /app/uploads/archives
VOLUME ["/app/uploads"]

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

EXPOSE 8003

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8003"]