FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN adduser --disabled-password --gecos "" appuser

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

CMD ["gunicorn", "flatflow.config.wsgi:application", "--bind", "0.0.0.0:8000"]
