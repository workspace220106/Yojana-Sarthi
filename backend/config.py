# TODO: Implement application configuration (env vars, settings)
from pathlib import Path

# ==========================
# Project Paths
# ==========================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

EMBEDDINGS_DIR = DATA_DIR / "embeddings"

FAISS_INDEX_PATH = EMBEDDINGS_DIR / "faiss.index"

METADATA_PATH = EMBEDDINGS_DIR / "chunks_metadata.json"

# ==========================
# Retrieval
# ==========================

TOP_K = 15
MAX_SCHEMES = 5

# ==========================
# Models
# ==========================

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

LLM_MODEL = "gemini-3.6-flash"

# ==========================
# API
# ==========================

API_TITLE = "Yojana Sarthi API"

API_VERSION = "1.0.0"