# Yojana Sarthi 🇮🇳

> AI-powered platform to help Indian citizens discover and apply for government schemes.

## Project Structure

- **frontend/** — React + Vite SPA (deployed on Vercel)
- **backend/** — FastAPI server with RAG pipeline
- **scraper/** — Data collection from MyScheme.gov.in
- **data/** — Raw, cleaned, chunked, and embedded scheme data
- **models/** — ML model weights (embeddings, whisper, reranker)
- **scripts/** — Utility scripts for indexing, backups, deployment
- **docs/** — Project documentation

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (coming soon)
pip install -r requirements.txt
uvicorn backend.app:app --reload
```

## License

See [LICENSE](LICENSE)
