# Software Design Document

## ClauseWise — AI-Powered Financial Document Analyser

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Architecture](#3-architecture)
4. [Frontend Design](#4-frontend-design)
5. [Backend Design](#5-backend-design)
6. [Data Architecture](#6-data-architecture)
7. [AI &amp; Document Processing Pipeline](#7-ai--document-processing-pipeline)
8. [Security Design](#8-security-design)
9. [Technology Stack Rationale](#9-technology-stack-rationale)
10. [User Flows](#10-user-flows)
11. [Non-Functional Requirements](#11-non-functional-requirements)

---

## 1. Introduction

### 1.1 Purpose

ClauseWise is an AI-powered web application that helps consumers understand and identify hidden risks in financial documents such as insurance policies, loan agreements, and credit card terms and conditions. The system extracts text from uploaded documents (PDFs, images, and Office files), classifies clauses by category and risk level, and presents a structured, colour-coded risk assessment to the user.

### 1.2 Problem Statement

Financial documents are deliberately complex. Key terms—such as penalty clauses, exclusion windows, and auto-renewal provisions—are buried in fine print and legal language. Ordinary consumers lack the expertise to evaluate risk. ClauseWise aims to bridge this gap by combining OCR, multi-provider AI analysis, and an interactive document viewer.

### 1.3 Scope

| In Scope                                         | Out of Scope                                 |
| ------------------------------------------------ | -------------------------------------------- |
| Document upload (PDF, PNG, JPG, DOCX, TXT)       | Legal advice or certified financial guidance |
| AI clause extraction and risk scoring            | Real-time collaborative editing              |
| Interactive highlighted document viewer          | Native mobile apps (iOS/Android)             |
| Conversational AI chat about the loaded document | Third-party broker integrations              |
| Analysis history and bookmarking                 | Direct document e-signing                    |
| Top-10 curated financial product lists           |                                              |

---

## 2. System Overview

ClauseWise is a **single-page application (SPA)** with a React/TypeScript frontend and a serverless backend powered by Supabase. Document analysis is performed by Supabase Edge Functions, which act as a secure proxy to multiple third-party AI APIs (Groq Llama-3.3, Google Gemini 2.0 Flash, OpenAI GPT-4o-mini) with automatic fallback.

### 2.1 Key Capabilities

- **Multimodal Document Ingestion** – Accepts PDFs (text-layer and scanned), images, and office documents.
- **Dual-path Analysis** – Gemini Vision for image-heavy documents; Groq/Gemini/OpenAI text models for text-layer PDFs.
- **Structured AI Output** – Every analysis returns a validated JSON object covering clauses, risk factors, key terms, financial implications, recommendations, and consumer rights.
- **Regex/Pattern Augmentation** – A domain-specific rule engine runs in parallel with the AI to catch known high-risk patterns (e.g. pre-existing condition exclusions, prepayment penalties).
- **Semantic Memory (RAG)** – Authenticated users benefit from Cohere-powered vector search over previous interactions to provide personalised, continuous advice.
- **Freemium Access** – Anonymous users receive a fixed trial allowance; registered users have unlimited access.

---

## 3. Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + TypeScript)                │  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐    │  │
│  │  │ Upload &   │  │  Clause    │  │   AI Chat         │    │  │
│  │  │ Analysis   │  │  Viewer    │  │   Interface       │    │  │
│  │  │ (OCR flow) │  │(Interactive│  │ (Streaming SSE)   │    │  │
│  │  └────────────┘  └────────────┘  └───────────────────┘    │  │
│  │                                                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────────┐    │  │
│  │  │ Analysis   │  │ Hero/      │  │ Top-10 Financial  │    │  │
│  │  │ History    │  │ Landing    │  │ Product Lists     │    │  │
│  │  └────────────┘  └────────────┘  └───────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / REST / SSE
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    Supabase Platform                           │
│                                                                │
│  ┌───────────────────┐  ┌───────────────────────────────────┐  │
│  │  Supabase Auth    │  │  Supabase Edge Functions (Deno)   │  │
│  │  (JWT, RLS)       │  │                                   │  │
│  └───────────────────┘  │  ┌────────────────┐               │  │
│                         │  │analyze-document│               │  │
│  ┌───────────────────┐  │  │  • OCR dispatch│               │  │
│  │  PostgreSQL DB    │  │  │  • AI fanout   │               │  │
│  │                   │  │  │  • Risk scoring│               │  │
│  │  • document_      │  │  └────────────────┘               │  │
│  │    analyses       │  │  ┌────────────────┐               │  │
│  │  • user_memories  │  │  │ ai-chat        │               │  │
│  │  • top_10_lists   │  │  │  • Context     │               │  │
│  │  • profiles       │  │  │  • Memory RAG  │               │  │
│  └───────────────────┘  │  │  • Streaming   │               │  │
│                         │  └────────────────┘               │  │
│  ┌───────────────────┐  └───────────────────────────────────┘  │
│  │ Supabase Storage  │                                         │
│  │  (documents/)     │  ┌───────────────────────────────────┐  │
│  └───────────────────┘  │  pgvector (user_memories)         │  │
│                         └───────────────────────────────────┘  │
└─────────────────────────────┬──────────────────────────────────┘
                              │ HTTPS
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │  Groq API    │   │ Gemini API   │   │ OpenAI API   │
  │ (Primary AI) │   │ (Vision +    │   │ (Fallback    │
  │ Llama-3.3-70b│   │  Text)       │   │  GPT-4o-mini)│
  └──────────────┘   └──────────────┘   └──────────────┘
```

### 3.2 Deployment Topology

| Layer          | Technology        | Hosting                |
| -------------- | ----------------- | ---------------------- |
| Frontend SPA   | React 18 + Vite 5 | Vercel (CDN)           |
| Edge Functions | Deno runtime      | Supabase Edge Network  |
| Database       | PostgreSQL 15     | Supabase managed cloud |
| Object Storage | S3-compatible     | Supabase Storage       |
| Authentication | JWT + OAuth       | Supabase Auth          |

---

## 4. Frontend Design

### 4.1 Directory Structure

```
src/
├── components/        # Reusable UI components
│   ├── ClauseViewer.tsx       # Interactive highlighted document viewer
│   ├── OCRAnalysis.tsx        # Orchestrates OCR + AI pipeline
│   ├── Navigation.tsx         # App-wide navigation
│   ├── HeroSection.tsx        # Landing page hero
│   ├── AuthProvider.tsx       # React context for auth state
│   └── ui/                    # Shadcn/Radix primitive components
├── pages/             # Route-level page components
│   ├── Index.tsx              # Landing page
│   ├── Upload.tsx             # Document upload and analysis
│   ├── Chat.tsx               # AI chat interface
│   ├── AnalysisHistory.tsx    # Saved analyses browser
│   └── Auth.tsx               # Sign-in / Sign-up
├── hooks/             # Custom React hooks
│   ├── useAnalysisHistory.ts  # CRUD for saved analyses
│   ├── useTrialUsage.ts       # Anonymous usage tracking
│   ├── useFileValidation.ts   # Client-side file constraints
│   └── useSEO.ts              # Dynamic meta tag management
├── services/          # API client utilities
├── integrations/
│   └── supabase/              # Auto-generated Supabase client + types
└── utils/             # Pure helper functions
```

### 4.2 Key Components

#### 4.2.1 `Upload.tsx` — Document Ingestion Entry Point

The Upload page handles the full user journey from file selection to results display.

**State machine (simplified):**

```
IDLE ──► FILE_SELECTED ──► ANALYZING ──► RESULTS_SHOWN
  ▲              │               │
  └──────────────┘ (select       │ (auto-save to DB
     different)      different)    if user is authenticated)
```

**Responsibilities:**

- Validate file type and size (10 MB max, types: PDF, DOCX, TXT, JPG, PNG).
- Enforce trial quota for anonymous users via `useTrialUsage`.
- Render the `OCRAnalysis` component which orchestrates the backend call.
- On completion, auto-save the structured result and upload the original file to Supabase Storage.
- Provide post-analysis actions: Discuss Document (navigates to `/chat`), Download PDF Report, Save Bookmark, View History.

#### 4.2.2 `OCRAnalysis.tsx` — Analysis Orchestrator

This component drives the backend call and handles multimodal vs. text-only routing:

1. **Text layer extraction** — Uses `pdfjs-dist` to read embedded text from PDFs.
2. **OCR fallback** — If confidence is low, uses `tesseract.js` (WASM-based) to perform browser-side OCR.
3. **Multimodal path** — For scanned documents/images, encodes the file as base64 and passes it alongside extracted text to the `analyze-document` Edge Function.
4. **Result normalisation** — Merges the AI structured JSON with any client-side OCR metadata before surfacing the final `OCRAnalysisResult`.

#### 4.2.3 `ClauseViewer.tsx` — Interactive Document Viewer

Renders the extracted document text with inline clause highlighting, powered by positional substring matching.

**Algorithm:**

1. For each clause returned by the AI, search for the first 80 characters of `clause.text` within `extractedText` (case-insensitive).
2. Record `{ start, end, clauseIndex }` for each match and sort by position.
3. Interleave matched `<mark>` elements with plain `<span>` segments to build the full highlighted rendering.
4. Clicking a highlighted segment opens an animated slide-in panel (Framer Motion) showing the clause's category, risk level, plain-language explanation, and navigation between clauses.

**Risk colour coding:**

| Risk Level | Background       | Border           |
| ---------- | ---------------- | ---------------- |
| High       | `destructive/20` | `destructive/40` |
| Medium     | `accent/20`      | `accent/40`      |
| Low / Safe | `secondary/20`   | `secondary/40`   |

### 4.3 Routing

Built with React Router v6.

| Route      | Component         | Auth Required              |
| ---------- | ----------------- | -------------------------- |
| `/`        | `Index`           | No                         |
| `/upload`  | `Upload`          | No (trial quota)           |
| `/chat`    | `Chat`            | No (trial quota)           |
| `/history` | `AnalysisHistory` | Yes                        |
| `/auth`    | `Auth`            | No (redirect if logged in) |
| `*`        | `NotFound`        | No                         |

### 4.4 State Management

- **Server state** — Managed via `@tanstack/react-query` for auth user, analysis history, and top-10 lists.
- **Local UI state** — Plain `useState`/`useReducer` hooks within components.
- **Cross-page document context** — Stored in `localStorage` (`'documentContext'` key) to allow the Upload page to pass a loaded document into the Chat page without a database round-trip.

---

## 5. Backend Design

### 5.1 Supabase Edge Functions

All business logic that requires API secrets runs inside Supabase Edge Functions (Deno runtime). No secrets are sent to the browser.

#### 5.1.1 `analyze-document` Function

**Endpoint:** `POST /functions/v1/analyze-document`

**Input Schema:**

| Field           | Type                | Description                                  |
| --------------- | ------------------- | -------------------------------------------- |
| `fileName`      | `string` (required) | Original file name                           |
| `fileType`      | `string`            | MIME type                                    |
| `extractedText` | `string`            | Pre-extracted text (up to 500 000 chars)     |
| `ocrConfidence` | `number [0-100]`    | Confidence from client-side OCR              |
| `documentType`  | `enum`              | `insurance \| loan \| creditCard \| unknown` |
| `fileBase64`    | `string?`           | Base64-encoded file for multimodal path      |
| `fileMimeType`  | `string?`           | MIME type for multimodal path                |

**Processing Flow:**

```
Request received
      │
      ├─► Validate & sanitise inputs
      │
      ├─► [if fileBase64 present] ──► Gemini Vision (multimodal)
      │         │
      │         └─► parseAIResponse() → structuredResult
      │
      ├─► [if no multimodal result] ──► performTextAnalysis()
      │         │
      │         ├─► Try Groq (llama-3.3-70b-versatile)
      │         └─► Fallback: Gemini 2.0 Flash text
      │
      ├─► Pattern-based analysis (regex risk patterns)
      │         └─► classifyClauses() + analyzeRiskPatterns()
      │
      ├─► calculateRiskScore() (0-100)
      │
      └─► Merge & return unified JSON response
```

**Risk Scoring Algorithm:**

```
baseScore = 30
+ 15 per high-risk regex match (max 3 matches counted)
+ 8 per medium-risk regex match (max 3 matches counted)
− 3 per low-risk (beneficial) match
+ 5 per high-risk classified clause (max 3 sentences)
+ 3 per medium-risk classified clause (max 3 sentences)
+ 10 if OCR confidence < 70%
+ 5 if OCR confidence < 85%
= clamp(result, 0, 100)

riskLevel: score ≥ 70 → high | score ≥ 40 → medium | else → low
```

**Domain-Specific Risk Patterns:**

The function contains a curated regex library (`RISK_PATTERNS`) covering three document domains:

| Domain       | High-Risk Patterns (examples)                                                           |
| ------------ | --------------------------------------------------------------------------------------- |
| `insurance`  | Pre-existing condition exclusion, claim rejection, permanent exclusion, waiting periods |
| `loan`       | Prepayment penalty, floating rate clause, cross-default/acceleration                    |
| `creditCard` | High APR disclosure, cash advance fees, overlimit fee                                   |

#### 5.1.2 `ai-chat` Function

**Endpoint:** `POST /functions/v1/ai-chat`

**Input Schema:**

| Field             | Type            | Description                           |
| ----------------- | --------------- | ------------------------------------- |
| `messages`        | `ChatMessage[]` | Conversation history (max 50 msgs)    |
| `stream`          | `boolean`       | Enable Server-Sent Events streaming   |
| `documentContext` | `object?`       | Structured context from last analysis |

**System Prompt Strategy:**

The function constructs a layered system prompt:

1. **Base system prompt** — Establishes ClauseWise persona and expertise scope (insurance, loans, credit cards, investment).
2. **Document context injection** — If a document is loaded, the full extracted text (up to 15 000 chars) and detected risk metadata are appended as a second system message.
3. **Semantic memory context** — For authenticated users, Cohere `embed-multilingual-v3.0` generates a query embedding from the last user message, which is used to retrieve the top-3 most relevant past memories via `pgvector` similarity search. These memories are injected as a third system message.

**AI Provider Fallback Order:**

1. Groq — `llama-3.3-70b-versatile` (primary, lowest latency)
2. OpenAI — `gpt-4o-mini` (secondary fallback)

Streaming (SSE) responses are piped directly from the AI provider to the browser without buffering.

---

## 6. Data Architecture

### 6.1 Database Schema

#### Table: `document_analyses`

Stores every analysis performed by authenticated users.

| Column             | Type                     | Notes                     |
| ------------------ | ------------------------ | ------------------------- |
| `id`               | `uuid` PK                | Auto-generated            |
| `user_id`          | `uuid` FK → `auth.users` | Owner                     |
| `file_name`        | `text`                   | Original filename         |
| `file_type`        | `text`                   | MIME type                 |
| `file_size`        | `int8`                   | Bytes                     |
| `risk_score`       | `int4`                   | 0–100                     |
| `risk_level`       | `text`                   | `low \| medium \| high`   |
| `analysis_summary` | `text`                   | Short executive summary   |
| `analysis_result`  | `jsonb`                  | Full structured AI output |
| `ocr_result`       | `jsonb`                  | Raw OCR metadata          |
| `is_saved`         | `bool`                   | User-bookmarked flag      |
| `created_at`       | `timestamptz`            | Auto-set                  |
| `updated_at`       | `timestamptz`            | Auto-updated              |

#### Table: `user_memories`

Enables personalised RAG via pgvector.

| Column        | Type           | Notes                        |
| ------------- | -------------- | ---------------------------- |
| `id`          | `uuid` PK      | Auto-generated               |
| `user_id`     | `uuid` FK      | Owner                        |
| `content`     | `text`         | Memory content               |
| `memory_type` | `text`         | E.g.`preference`, `analysis` |
| `embedding`   | `vector(1024)` | Cohere embedding             |
| `created_at`  | `timestamptz`  |                              |

#### Table: `top_10_lists`

AI-generated curated product rankings (read-only for public users).

| Column              | Type          | Notes                                  |
| ------------------- | ------------- | -------------------------------------- |
| `id`                | `uuid` PK     |                                        |
| `category`          | `text` UNIQUE | E.g.`credit-cards`, `health-insurance` |
| `products`          | `jsonb`       | Array of ranked products               |
| `generated_at`      | `timestamptz` | Last AI refresh                        |
| `refresh_frequency` | `text`        | E.g.`weekly`                           |
| `metadata`          | `jsonb`       | Display title, icon                    |

**Pre-seeded categories:** credit-cards, health-insurance, life-insurance, loans, ULIPs, mutual-funds.

### 6.2 Structured Analysis JSON Schema

The AI is instructed to return—and the backend merges and validates—the following structure:

```json
{
  "documentType": "insurance | loan | creditCard | investment | unknown",
  "summary": "string",
  "riskScore": 0-100,
  "riskLevel": "low | medium | high",
  "keyTerms": [
    { "term": "string", "value": "string", "importance": "high | medium | low" }
  ],
  "clauses": [
    {
      "text": "Exact clause text",
      "category": "Fees | Penalties | Exclusions | Coverage | Liability | Termination | Auto-Renewal | Interest | Rights",
      "riskLevel": "high | medium | low | safe",
      "explanation": "Plain language explanation",
      "clauseNumber": "string?"
    }
  ],
  "riskFactors": [
    { "factor": "string", "severity": "high | medium | low", "details": "string" }
  ],
  "benefits": [{ "benefit": "string", "details": "string" }],
  "financialImplications": [
    { "item": "string", "amount": "string", "frequency": "one-time | monthly | annual | per-event", "impact": "high | medium | low" }
  ],
  "recommendations": [
    { "action": "string", "priority": "high | medium | low", "reason": "string" }
  ],
  "consumerRights": ["string"]
}
```

### 6.3 Object Storage

Uploaded files are persisted in Supabase Storage under the path:

```
documents/{user_id}/{analysis_id}/{sanitized_filename}
```

The storage path is embedded in `analysis_result.sourceFile` to allow the Analysis History page to reconstruct the original PDF for the interactive annotator.

---

## 7. AI & Document Processing Pipeline

### 7.1 End-to-End Flow

```
User uploads file
        │
        ▼
[Client] pdfjs-dist extracts text layer
        │──► text confidence check
        │
        ├─ Low confidence? ──► tesseract.js browser OCR
        │
        ▼
[Client] POST /functions/v1/analyze-document
        │
        ├─ Image/scanned PDF? ──► include fileBase64 + fileMimeType
        │                             │
        │                             ▼
        │              [Edge] Gemini 2.0 Flash Vision
        │                    (multimodal analysis)
        │
        ├─ Text available? ──► [Edge] Groq llama-3.3-70b
        │                         │─ fail? ──► Gemini text
        │
        ├─ [Edge] RISK_PATTERNS regex scan
        ├─ [Edge] CLAUSE_CATEGORIES keyword classification
        └─ [Edge] Risk score calculation
                │
                ▼
        JSON response returned
                │
                ▼
[Client] OCRAnalysis renders results
[Client] Upload.tsx auto-saves to Supabase DB
[Client] ClauseViewer highlights document text
```

### 7.2 Clause Classification Categories

Eight domain-agnostic categories are used for heuristic keyword classification:

| Category       | Trigger Keywords                                 |
| -------------- | ------------------------------------------------ |
| Fees & Charges | fee, charge, cost, premium, processing           |
| Penalties      | penalty, late, overdue, default, bounce          |
| Exclusions     | exclusion, excluded, not covered, limitation     |
| Liability      | liability, indemnify, waiver, disclaimer         |
| Termination    | termination, cancellation, surrender, exit       |
| Auto-Renewal   | auto-renewal, automatic, recurring, subscription |
| Coverage       | coverage, benefit, sum assured, insured          |
| Interest       | interest, rate, APR, EMI, repayment              |

### 7.3 Semantic Memory (RAG) Flow

```
User sends chat message
        │
        ▼
[Edge] Cohere embed-multilingual-v3.0 (1024-dim vector)
        │
        ▼
[Edge] pgvector similarity search (threshold 0.5, top 3)
        │
        ▼
[Edge] Inject matched memories into system prompt
        │
        ▼
[Edge] AI generates personalised, contextual response
```

---

## 8. Security Design

### 8.1 Authentication & Authorisation

| Feature              | Implementation                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| Authentication       | Supabase Auth (email/password + OAuth)                                  |
| Session tokens       | Short-lived JWTs, auto-refreshed                                        |
| Row Level Security   | Enabled on all user-owned tables                                        |
| API secret isolation | All keys held in Supabase Vault (Edge Function env vars only)           |
| CORS                 | Edge functions return appropriate `Access-Control-Allow-Origin` headers |

### 8.2 Row Level Security (RLS) Policies

**`document_analyses`:**

- `SELECT` / `INSERT` / `UPDATE` / `DELETE` — Allowed only where `user_id = auth.uid()`.

**`top_10_lists`:**

- `SELECT` — Public read (`TO public USING (true)`).
- `ALL` — Restricted to `service_role` (used by periodic AI refresh jobs).

### 8.3 Input Validation

All Edge Function inputs are validated by a shared `_shared/validation.ts` module:

- `validateString` — enforces `maxLength` and `required` constraints.
- `validateNumber` — enforces `min/max` bounds.
- `validateEnum` — restricts `documentType` to known values.
- `validateChatMessages` — enforces max message count and per-message length.
- `sanitizeText` — strips control characters and potentially dangerous content before AI submission.

A custom `ValidationError` class produces a standardised `400` error response.

### 8.4 Trial / Rate Limiting

Anonymous users are tracked via `localStorage`. The `useTrialUsage` hook enforces a configurable document analysis quota. Authenticated users are exempt. No server-side rate limiting is implemented in the current version (intended for future work).

---

## 9. Technology Stack Rationale

| Choice                    | Rationale                                                                 |
| ------------------------- | ------------------------------------------------------------------------- |
| **React 18 + TypeScript** | Strong ecosystem, type-safety, component reuse                            |
| **Vite 5**                | Fast HMR, ES module-native build pipeline                                 |
| **Tailwind CSS**          | Utility-first rapid styling; consistent design tokens                     |
| **Shadcn/Radix UI**       | Unstyled, accessible primitives; full theming control                     |
| **Framer Motion**         | Smooth clause panel animations without custom animation code              |
| **React Router v6**       | Declarative nested routing, data loaders                                  |
| **TanStack Query v5**     | Caching, background refetching, optimistic updates                        |
| **Supabase**              | Batteries-included BaaS: auth, Postgres, storage, edge functions          |
| **pdfjs-dist**            | Client-side PDF text extraction (no server upload required for text PDFs) |
| **tesseract.js**          | Browser-native OCR for scanned documents                                  |
| **Groq (primary AI)**     | Lowest-latency LLM inference; Llama-3.3-70b quality                       |
| **Gemini 2.0 Flash**      | Multimodal vision capability for image/scanned PDF analysis               |
| **Cohere Embed**          | Multilingual semantic embeddings for memory retrieval                     |
| **jsPDF**                 | Client-side PDF report generation                                         |
| **pgvector**              | Native Postgres vector search for semantic memory                         |

---

## 10. User Flows

### 10.1 Document Upload & Analysis

```
User ──► Drag/drop file ──► Client validates (size, type)
                                │
                                ▼
                      pdfjs-dist extracts text
                                │
                         Low confidence?
                        Yes ──► tesseract.js OCR
                                │
                                ▼
                    POST /functions/v1/analyze-document
                                │
                         AI Analysis runs
                       (Groq / Gemini / Vision)
                                │
                                ▼
                    Structured JSON result returned
                                │
                       ┌────────┴────────┐
                   Authenticated?       Anonymous?
                       │                     │
                  Auto-save to DB       Record trial usage
                  Upload file to         in localStorage
                  Storage bucket
                       │
                       ▼
               ClauseViewer renders
               highlighted document text
```

### 10.2 AI Chat with Document Context

```
User clicks "Discuss This Document"
        │
        ▼
documentContext written to localStorage
        │
        ▼
Navigate to /chat
        │
        ▼
Chat page reads documentContext from localStorage
        │
        ▼
User types message ──► POST /functions/v1/ai-chat
        │                    with messages + documentContext
        │
   (Authenticated?)
   Yes ──► Cohere embedding ──► pgvector memory lookup
        │                            │
        └────────────────────────────┘
                    │
              AI response (SSE stream)
                    │
              Renders in chat UI (react-markdown)
```

---

## 11. Non-Functional Requirements

| Requirement                   | Target                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| **Analysis latency (p50)**    | < 8 seconds end-to-end (including OCR)                      |
| **AI streaming first-token**  | < 2 seconds                                                 |
| **File size limit**           | 10 MB                                                       |
| **Supported document types**  | PDF, DOCX, TXT, JPG, JPEG, PNG                              |
| **Extracted text limit**      | 500 000 characters                                          |
| **AI context window used**    | 15 000 characters (trimmed)                                 |
| **Max chat history**          | 50 messages                                                 |
| **Memory vector dimensions**  | 1 024 (Cohere multilingual)                                 |
| **Semantic search threshold** | 0.5 cosine similarity                                       |
| **Availability**              | Dependent on Supabase SLA (~99.9%)                          |
| **Accessibility**             | Radix UI primitives ensure ARIA compliance                  |
| **SEO**                       | Dynamic `<title>` and meta tags per route via `useSEO` hook |

---

_Generated for academic/design submission purposes. ClauseWise does not provide legal or certified financial advice._
