# Yojana Sarthi — Dataset Loading for Schemes Matrix

## Overview

In accordance with your strict instructions, **we will not touch, edit, or modify any files in the `backend/rag/` folder, the `data/` folder, or any AI data/model files**. 

Instead, we will read the existing read-only schemes dataset (`data/embeddings/chunks_metadata.json`) dynamically from our backend route [schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py). This will extract the real 85 schemes with their metadata, eligibility rules, and required documents, and serve them to the Scheme Matrix and Benefit Planner frontend pages without modifying any RAG logic or dataset files.

---

## User Review Required

> [!IMPORTANT]
> **RAG & AI Data Integrity**: No files in `backend/rag/` or `data/` will be edited. The requirements and dependencies for the RAG pipeline (`sentence-transformers`, `faiss-cpu`) will remain intact in `requirements.txt`.
>
> **Dynamic Loading**: [schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py) will only read `chunks_metadata.json` at startup to extract the schemes catalog.

---

## Proposed Changes

---

### Backend Components

#### [MODIFY] [backend/routes/schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py)
- Import `json`, `re`, and read `data/embeddings/chunks_metadata.json`.
- Group chunks by scheme title to construct a dynamic schemes catalog.
- Parse section text blocks (`Benefits`, `Eligibility`, `Documents Required`) to populate properties like categories, benefits, document lists, and age rules.
- Serve this data on `GET /api/schemes/` and `POST /api/schemes/compare`.

---

## Verification Plan

### Automated Tests
- Verify that `backend/routes/schemes.py` compiles successfully.
- Verify that the FastAPI server starts and `GET /api/schemes/` returns the complete 85 schemes list.
