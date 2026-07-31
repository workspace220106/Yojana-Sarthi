# ─────────────────────────────────────────────
# Yojana Sarthi – Cloud Run Optimised Dockerfile
# ─────────────────────────────────────────────

# Stage 1: Build dependencies
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy & install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ─────────────────────────────────────────────
# Stage 2: Runtime image (lean)
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Copy application source
COPY backend/ ./backend/
COPY data/ ./data/

# Sentence Transformers model cache dir (pre-cache at build time)
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence_transformers
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
ENV HF_HOME=/app/.cache/huggingface

# Pre-download the embedding model during build (bakes it into image = no cold-start download)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Cloud Run injects PORT=8080 via env var at runtime
ENV PORT=8080

EXPOSE 8080

# Start FastAPI — reads $PORT set by Cloud Run
CMD uvicorn backend.app:app --host 0.0.0.0 --port $PORT
