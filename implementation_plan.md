# Yojana Sarthi — 4-Feature Implementation Plan

## Overview

This plan builds four major features on top of the existing Yojana Sarthi codebase:
1. **Scheme Matrix** — A rich, interactive comparison + lifecycle planner
2. **Voice Model** — Real speech-to-text and text-to-speech in English, Hindi, and Marathi
3. **Admin Portal** — A functional backend-connected admin dashboard
4. **Multi-lingual** — Platform-wide i18n for English, Hindi, and Marathi using `i18next`

The app uses **React + Vite** (frontend) and **FastAPI** (backend), with **Supabase** for auth/data and **Gemini** as the LLM.

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Scheme Matrix Data Source**
> The existing `SchemeComparison.jsx` shows 3 static schemes. Should the matrix pull live data from the RAG pipeline / Supabase, or continue with expanded static scheme data for now?
> - Option A: Static enriched dataset (fast, no backend change)
> - Option B: Live from RAG pipeline via `/schemes` endpoint (recommended for production)

> [!IMPORTANT]
> **Q2 — Voice: Browser Web Speech API vs Google Cloud Speech**
> For speech-to-text, two options exist:
> - **Web Speech API** (browser-built-in, free, no key needed) — works well in Chrome, limited Hindi/Marathi support on some browsers
> - **Google Cloud Speech-to-Text API** (requires `GOOGLE_APPLICATION_CREDENTIALS`, excellent Hindi/Marathi) — costs money per use
> Which do you prefer? **Recommended: Web Speech API for now** (zero cost, good enough for Marathi/Hindi on modern browsers).

> [!IMPORTANT]
> **Q3 — Text-to-Speech (TTS)**
> - **Web Speech Synthesis API** (free, browser built-in) — `mr-IN`, `hi-IN`, `en-IN` voices
> - **Google Cloud TTS** (premium, costs money)
> Recommended: Web Speech Synthesis API (free, works offline, supports all 3 languages).

> [!IMPORTANT]
> **Q4 — Admin Portal Authentication**
> Currently the Admin Portal has no access control. Should admin routes be:
> - Gated by a special Supabase role (e.g., `is_admin = true` in the profiles table)?
> - Or left open for demo purposes?

> [!WARNING]
> **Multilingual (i18n) Framework**
> You mentioned "GTKS" — this is interpreted as **i18next** (the standard React i18n library, often used with Google Translate). If you meant a different tool (e.g., Google Cloud Translation API for live translation), please clarify.
> **Plan uses: `i18next` + `react-i18next`** with static JSON translation files (no API costs).

---

## Proposed Changes

---

### Feature 1 — Scheme Matrix & Lifecycle Planner

The `SchemeComparison` page (Scheme Matrix at `/comparison`) will be rebuilt into a rich, interactive tool. The `BenefitPlanner` page (`/planner`) will be enhanced with real lifecycle stages and scheme recommendations.

#### [MODIFY] [SchemeComparison.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/SchemeComparison.jsx)
- Rename to **Scheme Matrix** in the UI
- Add multi-scheme selector (choose 2–4 schemes to compare)
- Full comparison table: Category, Benefit Amount, Eligibility, Documents, Priority, Application Link
- Add **Allocation Summary** panel: shows total potential benefit amount for selected schemes
- Filter by category (Agriculture, Education, Health, Housing, etc.)
- Color-coded priority badges (High / Medium / Low)

#### [MODIFY] [SchemeComparison.css](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/SchemeComparison.css)
- Full redesign with premium card layout, sticky header column, responsive horizontal scroll

#### [MODIFY] [BenefitPlanner.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/BenefitPlanner.jsx)
- Add 6 lifecycle stages: Birth, School, Higher Education, Employment, Family, Senior/Retirement
- Show per-stage scheme recommendations (linked from the Scheme Matrix data)
- Clickable stages that expand to show applicable schemes
- Progress indicator based on user's age (read from `localStorage` profile)

#### [MODIFY] [BenefitPlanner.css](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/BenefitPlanner.css)
- Animated vertical timeline with connecting lines and pulsing current-stage indicator

#### [MODIFY] [schemes.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/schemes.py)
- Implement `/schemes` GET endpoint returning list of schemes with full metadata
- `/schemes/compare` POST endpoint accepting scheme IDs and returning comparison data
- Static enriched data initially (20+ schemes across categories)

#### [MODIFY] [app.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/app.py)
- Register the schemes router

---

### Feature 2 — Voice Model (English, Hindi, Marathi)

Fully rebuild the `VoiceInterface` page with real Web Speech API integration. Also add a backend `/speech` endpoint for server-side TTS if needed.

#### [MODIFY] [VoiceInterface.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/VoiceInterface.jsx)
- Use **Web Speech API** (`SpeechRecognition`) for STT
  - Language selector: English (`en-IN`), Hindi (`hi-IN`), Marathi (`mr-IN`)
  - Switching language changes the recognition `lang` attribute live
  - Real-time interim transcript display with final confirmed text
- Use **Web Speech Synthesis API** (`SpeechSynthesis`) for TTS
  - "Speak Response" button reads AI response aloud in chosen language
  - Voice auto-selected based on language (prefers Indian voices)
- Connect to existing AI Assistant: after recognizing speech, query the `/chat` endpoint and display + speak the answer
- Visual waveform animation while listening (CSS keyframes)
- Microphone permission status indicator

#### [MODIFY] [VoiceInterface.css](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/VoiceInterface.css)
- Premium animated mic button, waveform bars, language pill selector

#### [MODIFY] [speech.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/services/speech.py)
- Implement `SpeechService` class with `text_to_speech(text, lang)` method (using `gTTS` library or Gemini TTS)
- `speech_to_text(audio_bytes, lang)` stub for future Google Cloud STT upgrade

#### [NEW] `backend/routes/speech.py`
- `POST /speech/tts` — accepts text + language code, returns audio bytes (MP3)
- `POST /speech/stt` — accepts audio file, returns transcript (future)

#### [MODIFY] [app.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/app.py)
- Register the speech router

#### Backend dependency additions to `requirements.txt`:
- `gtts` (Google Text-to-Speech, free, no API key)
- `python-multipart` (for file uploads)

---

### Feature 3 — Admin Portal

Rebuild the Admin Portal with real functionality backed by Supabase and a FastAPI admin router.

#### [MODIFY] [AdminPortal.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/AdminPortal.jsx)
- **Summary Tab**: Live stats fetched from `/admin/stats` (total users, active schemes, pending verifications, fraud alerts)
- **Citizens Tab**: Real paginated citizen list from Supabase via `/admin/citizens`
  - Search by name / email
  - Status filter (Verified / Unverified / Flagged)
  - "Manage" opens a user detail modal with profile + document status
- **Scheme Config Tab**: Add/edit/disable schemes (CRUD via `/admin/schemes`)
- **Fraud Alerts Tab**: Real alert list, ability to mark as reviewed
- **Logs Tab**: Activity log from backend
- **Access Control**: Check `is_admin` flag in the logged-in user's Supabase profile; redirect non-admins

#### [MODIFY] [AdminPortal.css](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/AdminPortal.css)
- Rich dark-mode admin dashboard, data tables, modal overlay, status badges

#### [MODIFY] [admin.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/admin.py)
- Implement routes:
  - `GET /admin/stats` — returns aggregate stats
  - `GET /admin/citizens` — paginated citizen list from Supabase
  - `GET /admin/citizens/{id}` — citizen detail
  - `PATCH /admin/citizens/{id}/status` — update citizen status
  - `GET /admin/fraud-alerts` — list alerts
  - `PATCH /admin/fraud-alerts/{id}` — mark reviewed
  - `GET /admin/schemes` — list all schemes
  - `POST /admin/schemes` — add scheme
  - `PATCH /admin/schemes/{id}` — edit scheme
  - `DELETE /admin/schemes/{id}` — disable scheme
- Admin auth middleware: verify JWT and check `is_admin` in Supabase profile

#### [MODIFY] [app.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/app.py)
- Register the admin router

#### [NEW] Frontend `src/services/adminService.js`
- Functions: `fetchStats()`, `fetchCitizens(page, query)`, `updateCitizenStatus()`, `fetchAlerts()`, `resolveAlert()`, `fetchSchemes()`, `saveScheme()`, `deleteScheme()`

---

### Feature 4 — Multi-lingual (English, Hindi, Marathi) with i18next

Add platform-wide internationalization so every UI string can switch between English, Hindi, and Marathi.

#### New Dependencies (frontend `package.json`):
- `i18next`
- `react-i18next`

#### [NEW] `frontend/src/i18n/index.js`
- i18next configuration: detects browser language, falls back to English

#### [NEW] `frontend/src/i18n/locales/en.json`
- English translation strings for all UI labels (navigation, buttons, headings, form labels)

#### [NEW] `frontend/src/i18n/locales/hi.json`
- Hindi translation strings (मुखपृष्ठ, योजना मैट्रिक्स, आवाज पोर्टल, etc.)

#### [NEW] `frontend/src/i18n/locales/mr.json`
- Marathi translation strings (मुखपृष्ठ, योजना मॅट्रिक्स, आवाज पोर्टल, etc.)

#### [MODIFY] [main.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/main.jsx)
- Import and initialize i18n before rendering `<App />`

#### [MODIFY] [Multilingual.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/Multilingual.jsx)
- Focus on English, Hindi, Marathi (remove other languages or de-emphasize)
- On language selection → call `i18n.changeLanguage(code)` → persist to `localStorage`
- Live preview: show a sample text block translated in real-time
- "Apply Language" button updates the entire app UI instantly

#### [MODIFY] [Multilingual.css](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/Multilingual.css)
- Premium language card UI with flag-like color accents for each language

#### Key pages to wire up with `useTranslation()`:
- [Sidebar.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/components/Sidebar.jsx) — nav item labels
- [Dashboard.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/Dashboard.jsx) — headings, stat labels
- [Landing.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/Landing.jsx) — hero text, CTA buttons
- [AIAssistant.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/AIAssistant.jsx) — chat UI labels
- [VoiceInterface.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/VoiceInterface.jsx) — mic button, status text
- [AdminPortal.jsx](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/frontend/src/pages/AdminPortal.jsx) — table headers, tab labels

#### [MODIFY] [translate.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/routes/translate.py)
- `POST /translate` — accepts text + target language code, uses Gemini to translate (for dynamic content like AI responses)

#### [MODIFY] [translator.py](file:///c:/Users/araji/Downloads/Yojana%20Sarthi/backend/services/translator.py)
- Implement `TranslationService` using Gemini API to translate text to `hi`, `mr`, or `en`

---

## Verification Plan

### Automated / Manual
- **Scheme Matrix**: Open `/comparison`, verify 2+ schemes can be selected, comparison table renders, lifecycle planner shows correct stages for age in profile.
- **Voice**: Open `/voice`, select Marathi, click mic, speak — verify transcript appears. Click TTS button — verify audio plays in Marathi.
- **Admin Portal**: Log in as admin user, open `/admin`, verify stats load, citizen table paginates, fraud alert can be marked resolved.
- **Multilingual**: Open `/multilingual`, click Hindi → verify all sidebar labels and key headings switch to Hindi. Click English → switch back.

### Build Check
```
cd frontend && npm run build
```
No TypeScript/build errors expected.
