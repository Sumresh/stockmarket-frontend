# StockCheck AI — Frontend

A React + Vite frontend for the StockCheck AI stock market intelligence system.

## Tech Stack
- **React 18** + Vite
- **React Router v6** — client-side routing
- **Supabase** — real auth + direct portfolio reads
- **Axios** — API calls to FastAPI backend
- **Recharts** — charts
- **Lucide React** — icons

## Features
- 🔐 Supabase Auth (login / register / session persistence)
- 📊 Dashboard with live portfolio from Supabase
- 🤖 AI Verdict: BUY / SELL / HOLD analysis
- 💬 AI Chat per stock ticker
- 💼 Portfolio CRUD (Supabase + backend fallback)
- 🔔 Email/WhatsApp alert tracking
- ⚙️ Settings — profile, alert channel (email/WhatsApp/both)

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
```

## Backend
Deployed at: `https://stockmarket-v1.vercel.app`  
Source: [stockmarket_v1](../stockmarket_v1)

## Hosting on Vercel
1. Push this repo to GitHub
2. Import into Vercel
3. Framework preset: **Vite**
4. No environment variables needed (Supabase keys are bundled)
5. Deploy ✅
