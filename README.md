# 📜 ClauseWise AI – Decode Financial Documents with AI

[![Vercel Deploy](https://img.shields.io/badge/Live-Demo-blue?logo=vercel)](https://clausewise-ai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/Built%20With-React-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg?logo=typescript)](https://www.typescriptlang.org/)

ClauseWise AI is a **smart, full-stack financial document analyzer** powered by AI. Built for modern users, it simplifies insurance policies, credit card T&Cs, and mutual fund jargon using **natural language processing**, an intuitive **chat-based UI**, and a polished design system.

---
![clausewise-logo-512](https://github.com/user-attachments/assets/9e1d6bc6-13b3-4e4d-8160-2f5bd4a3e66d)

## ClauseWise AI

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

### 🌞 Light Mode (Default)
<p align="center">
  <img src="https://github.com/user-attachments/assets/88c14d4a-e606-453b-b825-79cb0214e8e2" width="600"/>
  <img src="https://github.com/user-attachments/assets/e535223d-98c2-43fa-9595-fc4d246c232c" width="600"/>
  <img src="https://github.com/user-attachments/assets/4e98b2a8-a0e2-42b1-b1a7-6632824d094d" width="600"/>
  <img src="https://github.com/user-attachments/assets/355b7d24-8c95-4e83-bbeb-15ca08bef250" width="600"/>
  <img src="https://github.com/user-attachments/assets/03383a48-7174-4acf-9b86-d11e19cda456" width="600"/>
  <img src="https://github.com/user-attachments/assets/d033b959-9862-4910-8c2a-0958ac773296" width="600"/>
  <img src="https://github.com/user-attachments/assets/9113a5dd-7bb3-40be-95e8-43890cf0c854" width="600"/>
  <img src="https://github.com/user-attachments/assets/b42086ea-cad2-4269-b49c-44aba240c639" width="600"/>
  <img src="https://github.com/user-attachments/assets/dc78fb67-cd2b-4a64-a6ec-f487b0013113" width="600"/>
  <img src="https://github.com/user-attachments/assets/10b8f8b4-5f16-42f7-916a-5059c9acc42a" width="600"/>
  <img src="https://github.com/user-attachments/assets/8ea0cd84-2958-46b1-88af-0861e9846d0b" width="600"/>
  <img src="https://github.com/user-attachments/assets/c826792a-bbe8-40d3-84c0-f78cb50b0da2" width="600"/>
  <img src="https://github.com/user-attachments/assets/de641f75-1c52-490d-8772-a7b16d57e9a3" width="600"/>
</p>

### 🌚 Dark Mode
<p align="center">
  <img src="https://github.com/user-attachments/assets/173cc454-d3da-49cd-9e81-21648878cefb" width="600"/>
  <img src="https://github.com/user-attachments/assets/5a383c9f-d75c-4988-8b23-8adf06179e3d" width="600"/>
  <img src="https://github.com/user-attachments/assets/d91fc887-fc02-438d-8592-8b2b547175f4" width="600"/>
</p>

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
