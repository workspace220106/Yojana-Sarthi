# Yojana Sarthi — 4-Feature Implementation Plan (Refined)

## Overview

This plan details the implementation of four major features on top of the existing Yojana Sarthi codebase:
1. **Scheme Matrix & Lifecycle Planner** — Dynamic comparison dashboard and age-based eligibility roadmap linked to the backend scheme catalog.
2. **Voice Interface** — Speech-to-text (STT) and text-to-speech (TTS) in English, Hindi, and Marathi using the Web Speech API and backend fallbacks.
3. **Admin Portal** — A management panel connected to FastAPI backend routes, fetching and displaying real citizen profiles, fraud logs, and statistics using **Firebase / Firestore**.
4. **Platform Multilingual Support** — Global internalization (i18n) using `i18next` for all static UI, with Gemini-driven dynamic translations for chat outputs.

> [!NOTE]
> **Database Correction**: The original draft of the plan referenced using Supabase. However, since the existing citizen dashboard and login system are fully integrated with **Firebase (Authentication & Firestore)**, this refined plan corrects the database backing to **Firebase Admin SDK** for the backend routes and **Firestore** for the frontend admin queries.

---

## User Review Required

> [!IMPORTANT]
> **Q1 — Local Firebase Admin Access**
> Since the backend needs to read citizen profiles from Firestore for the Admin Portal, local development will require either:
> - Application Default Credentials (ADC) configured locally, OR
> - A local fallback mock database if Firebase Admin initialization fails.
> **We have configured the backend to automatically fall back to mock data if Firebase Admin is not authenticated locally**, ensuring local testing is seamless without requiring private key configurations.
>
> **Q2 — Voice API Integration**
> We are using the **Web Speech API** for browser-based speech recognition and synthesis. This keeps the implementation free and fully client-side. We also provide a backend fallback endpoint using the `gTTS` library to render text-to-speech on demand.

---

## Open Questions

> [!NOTE]
> **Dynamic Translation Optimization**
> Dynamic chat translations (`/api/translate`) will be powered by the Gemini client. To control costs, dynamic translation will only be invoked on AI assistant outputs, while all static UI copy will use pre-translated i18n JSON packages.

---

## Proposed Changes

---

### Backend Component (FastAPI)

#### [MODIFY] [requirements.txt](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/requirements.txt)
- Ensure both `firebase-admin` and `gtts` are configured for installation.
- Clean up unused or duplicate libraries.

#### [MODIFY] [backend/database/db.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/database/db.py)
- Initialize the Firebase Admin SDK using Application Default Credentials (ADC) or the project ID `yojana-sarthi`.
- Add a try-except fallback to return a Mock Firestore client wrapper if credentials are not configured (enabling local debugging).

#### [NEW] [backend/routes/schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py)
- Create `GET /api/schemes` to return the complete catalog of welfare schemes.
- Create `POST /api/schemes/compare` to accept multiple scheme IDs and return structured comparison parameters.

#### [NEW] [backend/routes/admin.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/admin.py)
- Create `GET /api/admin/stats` returning aggregate metrics (total users, verified vs. unverified, and unresolved fraud logs).
- Create `GET /api/admin/citizens` to fetch the paginated list of citizens directly from Firestore.
- Create `PATCH /api/admin/citizens/{id}/status` to update citizen verification statuses.
- Create `GET /api/admin/fraud-alerts` and `PATCH /api/admin/fraud-alerts/{id}` to view and resolve security flags.

#### [NEW] [backend/routes/speech.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/speech.py)
- Create `POST /api/speech/tts` accepting text and language code, returning synthesized MP3 audio bytes using the `gTTS` service.

#### [NEW] [backend/routes/translate.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/translate.py)
- Create `POST /api/translate` mapping input text to target languages (`en`, `hi`, `mr`) using the Gemini API client.

#### [MODIFY] [backend/app.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/app.py)
- Register the new routes (`schemes`, `admin`, `speech`, and `translate`) and verify middleware configurations.

---

### Frontend Component (React + Vite)

#### [MODIFY] [frontend/src/pages/SchemeComparison.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/SchemeComparison.jsx)
- Build the **Scheme Matrix** allowing interactive selection of 2-4 schemes.
- Implement side-by-side comparison tables containing: Benefits, eligibility rules, priority guidelines, and required documents.
- Add an Allocation Summary block showing total potential benefits.

#### [MODIFY] [frontend/src/pages/BenefitPlanner.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/BenefitPlanner.jsx)
- Retrieve the user's age from their profile and display an active timeline containing 6 lifecycle phases: Birth, School, Higher Education, Employment, Family, and Senior/Retirement.
- Display applicable schemes dynamically in each category.

#### [MODIFY] [frontend/src/pages/VoiceInterface.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/VoiceInterface.jsx)
- Implement real **Web Speech API** integration.
- Add a language dropdown switcher for English (`en-IN`), Hindi (`hi-IN`), and Marathi (`mr-IN`).
- Wire the transcript output to trigger chat assistant queries, and play back responses aloud using the browser's speech synthesis or the backend `/tts` endpoint.

#### [MODIFY] [frontend/src/pages/AdminPortal.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/AdminPortal.jsx)
- Connect all tabs to the backend `/api/admin` endpoints.
- Allow full management of user verifications, viewing system log summaries, and auditing flagged fraud logs.

#### [MODIFY] [frontend/src/pages/Multilingual.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/Multilingual.jsx)
- Update language selections to focus on English, Hindi, and Marathi.
- Connect buttons to `i18n.changeLanguage()` and save preferences to local storage.

#### [NEW] [frontend/src/i18n/index.js](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/i18n/index.js)
- Configure `i18next` with `react-i18next`, importing locale translations and defaulting to English.

#### [NEW] translation packages:
- [en.json](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/i18n/locales/en.json) (English)
- [hi.json](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/i18n/locales/hi.json) (Hindi)
- [mr.json](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/i18n/locales/mr.json) (Marathi)

---

## Verification Plan

### Automated Tests
- Execute `/api/schemes` and `/api/schemes/compare` queries to verify database connectivity.
- Verify translation API using requests to `/api/translate`.

### Manual Verification
- Open the `/comparison` page and verify that selected schemes update the allocation calculator.
- Open `/voice`, record questions in Hindi or Marathi, and confirm correct transcript creation and audio playback.
- Toggle between English, Hindi, and Marathi in `/multilingual` and verify immediate static text updates.
- Verify Admin Portal gates access based on the user's logged-in Firebase role.
