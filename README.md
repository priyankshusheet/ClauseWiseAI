# 📜 ClauseWise AI – Decode Financial Documents with AI

[![Vercel Deploy](https://img.shields.io/badge/Live-Demo-blue?logo=vercel)](https://clausewise-ai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/Built%20With-React-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg?logo=typescript)](https://www.typescriptlang.org/)

ClauseWise AI is a **smart, full-stack financial document analyzer** powered by AI. Built for modern users, it simplifies insurance policies, credit card T&Cs, and mutual fund jargon using **natural language processing**, an intuitive **chat-based UI**, and a polished design system.

---

## 🔍 Live Demo

🌐 [View the App](https://clausewise-ai.vercel.app)

---

## 🧪 Tech Stack

### 💻 Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Shadcn/UI**
- **Lucide React**

### 🤖 AI & Backend
- **Supabase Edge Functions (Deno)**
- **xAI Grok & Cohere API**
- **React Query (TanStack)**
- **Custom Toast Notifications**
- **File Parsing Logic**

---

## ✨ Features

### 🤖 ClauseWise ChatBot
- Conversational UI tailored for financial Q&A
- Role-based replies with dynamic avatars
- Intelligent clause explanations using xAI
- Real-time responses, errors, and fallbacks

### 📄 Document Uploader
- Drag & drop PDF, DOC, and TXT files
- Smart extraction and clause detection
- Highlights hidden clauses and exclusions

### 📊 Financial Knowledge Base
- Cards: Amex Gold, Chase Sapphire, Discover
- Insurance: HMO, PPO, Travel, Auto
- Mutual Funds: Index & Active Funds
- Click to auto-fill documents & test AI

### 🧠 Smart Financial Insights
- Hidden clauses, renewal traps, and fine print
- Translates legalese to plain English
- Dynamic highlights with interactive chat triggers

### 🎨 Modern UI/UX
- Gradient background, card-style layouts
- Minimalist, accessible, and fully responsive
- Sticky chat icon and polished animations

---

## 📱 User Experience Highlights

- Upload, chat, and analyze in a single flow
- Clean transitions with real-time feedback
- Toast messages for upload and errors
- Smart prompts to guide users

---

## 💡 Skills Demonstrated

### Frontend
- Type-safe component architecture
- Responsive UI using Tailwind & Shadcn
- Declarative routing and protected pages
- Animation & iconography with Lucide + smooth UX

### AI & Serverless
- Supabase Edge Functions using Deno runtime
- API integration with xAI Grok for NLP
- File parsing logic and clause extraction
- Reusable chat logic and bot context system

### Clean Architecture
- Modular folder structure
- State handling with React Query
- Toast, error, and loading management
- Extendable for future document types

---

## 🗂 Project Structure


- `public/` – Static assets like favicon, logos, and dataset documents
- `src/`
  - `components/` – Core UI sections and reusable elements
    - `ui/` – Atomic UI components (Button, Modal, Tabs, etc.) from shadcn/ui
    - Other UI Sections – `HeroSection`, `ChatInterface`, `Footer`, etc.
  - `hooks/` – Custom React hooks (`useToast`, `useMobile`)
  - `integrations/supabase/` – Supabase client and types for backend interaction
  - `lib/` – Utility functions (`utils.ts`)
  - `pages/` – Route-based pages (`Index.tsx`, `Chat.tsx`, `Upload.tsx`, etc.)
- `supabase/`
  - `functions/` – Edge functions for AI chat and document analysis
    - `ai-chat-analysis/` – AI-based chat interpretation logic
    - `document-analysis/` – OCR or file-based analysis logic
  - `config.toml` – Supabase function configuration
- `App.tsx` / `main.tsx` – Root component and app initialization
- `App.css` / `index.css` – Global styling
- `index.html` – HTML template for Vite
- `vite.config.ts` – Vite configuration
- `tailwind.config.ts` / `postcss.config.js` – Tailwind CSS configuration
- `tsconfig.*.json` – TypeScript config files
- `package.json` / `bun.lockb` / `package-lock.json` – Project dependencies
- `.gitignore` / `eslint.config.js` – Git and ESLint configuration
- `LICENSE` / `README.md` – Licensing and project documentation


---

## 📸 Screenshots

### Light Mode (Default)

<img width="1440" alt="Screenshot 2025-07-09 at 5 46 29 AM" src="https://github.com/user-attachments/assets/92527292-f7bd-466f-9e7b-2febccc7a356" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 46 39 AM" src="https://github.com/user-attachments/assets/532de3b8-49b3-43ee-ab37-da01f910d9e1" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 46 55 AM" src="https://github.com/user-attachments/assets/ab30b40a-76d3-4a26-8672-9e7d2b62d64f" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 48 27 AM" src="https://github.com/user-attachments/assets/f736763d-fe45-44be-a869-1e9430b19112" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 49 16 AM" src="https://github.com/user-attachments/assets/226d003c-ade4-44ea-a882-a6d4add34ba3" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 49 22 AM" src="https://github.com/user-attachments/assets/4769113f-8536-466b-9b13-22c36348ef1f" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 49 27 AM" src="https://github.com/user-attachments/assets/49f6c529-5f19-4168-9704-86dd89f7fa63" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 50 16 AM" src="https://github.com/user-attachments/assets/f2104b22-fcb5-47bf-bcaa-0871a94e1ae5" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 50 21 AM" src="https://github.com/user-attachments/assets/9c6185c2-4276-4240-ab30-24124facde3c" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 50 28 AM" src="https://github.com/user-attachments/assets/88b08f5f-33e4-49bc-92e4-32f698552663" />
<img width="1440" alt="Screenshot 2025-07-09 at 5 52 17 AM" src="https://github.com/user-attachments/assets/3494449a-2c56-45e2-8153-1daf16da5fa8" />

### Dark Mode

<img width="1440" alt="Screenshot 2025-07-09 at 5 54 22 AM" src="https://github.com/user-attachments/assets/407705b1-d854-40f5-a737-9d38fb1418d2" />






---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/priyankshusheet/ClauseWiseAI.git

# Navigate into the project directory
cd ClauseWiseAI

# Install dependencies
npm install

# Create a .env file and add your Supabase credentials
# (Refer to Supabase project settings for these values)
touch .env
# Then add the following lines inside it:
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Start development server
npm run dev

# The app will run locally — check your terminal for the exact localhost URL (default is http://localhost:5173)
