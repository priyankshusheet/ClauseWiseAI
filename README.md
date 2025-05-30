# 📜 ClauseWise AI – Decode Financial Documents with AI

[![Vercel Deploy](https://img.shields.io/badge/Live-Demo-blue?logo=vercel)](https://clausewiseai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/Built%20With-React-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg?logo=typescript)](https://www.typescriptlang.org/)

ClauseWise AI is a **smart, full-stack financial document analyzer** powered by AI. Built for modern users, it simplifies insurance policies, credit card T&Cs, and mutual fund jargon using **natural language processing**, an intuitive **chat-based UI**, and a polished design system.

---

## 🔍 Live Demo

🌐 [View the App](https://clausewiseai.vercel.app)

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
- **xAI Grok API**
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


- `public/` – Static assets like favicon, placeholder image, and robots.txt
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
<img width="1440" alt="Screenshot 2025-05-31 at 12 11 25 AM" src="https://github.com/user-attachments/assets/ffac37e0-415e-4ab2-afca-6e07ce5ab475" />
<img width="1440" alt="Screenshot 2025-05-31 at 12 11 36 AM" src="https://github.com/user-attachments/assets/5ec8a3d0-5724-42cd-a602-b814bba01bb9" />
<img width="1440" alt="Screenshot 2025-05-31 at 12 11 45 AM" src="https://github.com/user-attachments/assets/979a7738-1a85-4267-9772-c702a7eaaa8f" />
<img width="1440" alt="Screenshot 2025-05-31 at 12 14 56 AM" src="https://github.com/user-attachments/assets/75ff3fbf-41a9-4cc6-a057-bfa61a5f87e3" />
<img width="1440" alt="Screenshot 2025-05-31 at 12 15 12 AM" src="https://github.com/user-attachments/assets/8607e502-af6a-4503-98f2-7b29b8d24c6d" />
<img width="1440" alt="Screenshot 2025-05-31 at 12 15 29 AM" src="https://github.com/user-attachments/assets/3543403f-c479-4f36-b860-081956281268" />


---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/priyankshusheet/clausewise-ai.git

# Navigate into the project directory
cd clausewise-ai

# Install dependencies
npm install

# Start development server
npm run dev
