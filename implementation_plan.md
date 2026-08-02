# Yojana Sarthi — Lightweight Schemes Database & Keyword Finder

## Overview

To resolve the constraint of the 900MB memory footprint caused by the vector embedding pipeline (SentenceTransformers + PyTorch + FAISS), we are transitioning to a **metadata-driven database and keyword matching pipeline**. 

This plan details:
1. Purging `sentence-transformers`, `faiss-cpu`, `torch`, `transformers` from the backend dependencies.
2. Refactoring [vector_store.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/rag/vector_store.py) to parse `chunks_metadata.json` directly and query it using token-based weighting (title matches, tag matches, body matches).
3. Dynamically parsing the real **85-schemes dataset** (`data/embeddings/chunks_metadata.json`) in [schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py) to provide real-time eligibility comparisons instead of mock data.

---

## User Review Required

> [!IMPORTANT]
> **No Loss of Search Quality**: By utilizing token matching weighted strongly on titles and tags, the AI chat and voice assistant will still receive high-quality context injections without requiring heavy neural networks or PyTorch downloads.
>
> **Requirements Shrink**: The virtual environment size will shrink by ~800MB and starting uvicorn will take under 1 second and less than 30MB of RAM.

---

## Proposed Changes

---

### Backend Components

#### [MODIFY] [requirements.txt](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/requirements.txt) and [backend/requirements.txt](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/requirements.txt)
- Remove `sentence-transformers` and `faiss-cpu`.

#### [MODIFY] [backend/rag/vector_store.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/rag/vector_store.py)
- Remove `faiss`, `numpy`, `SentenceTransformer` imports.
- Load `chunks_metadata.json` at startup.
- Implement token-based regex search weighted on Title, Tags, and Text body.

#### [MODIFY] [backend/routes/schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py)
- Load `chunks_metadata.json` and group chunks by scheme title to construct a dynamic, real-time catalog of 85 schemes.
- Parse specific sections (e.g., `Benefits`, `Eligibility`, `Documents Required`) to populate search/comparison attributes.

---

## Verification Plan

### Automated Tests
- Verify that python files compile successfully without `faiss` or `sentence-transformers`.
- Run uvicorn server locally and verify that `/api/schemes` returns 85 schemes and `/api/chat` responds correctly.
