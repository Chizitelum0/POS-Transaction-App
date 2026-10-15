# POS-Transaction-App

A simple, fast web POS that works on any phone. Built for small shops in Nigeria to handle checkout, receipts, sales tracking, and stock - even offline.

### Why this?
Big POS hardware costs ₦300k+ and is complicated. Notebooks cause errors and theft. This works in Chrome on any phone/tablet/PC, no install needed.

### Features (V1)
- Fast checkout with product search
- Cart, discounts, tax
- Multiple payment methods: Cash, Transfer, Card, Mobile Money
- Receipts: Print + WhatsApp
- Offline mode: Sell without internet, syncs later
- Sales history & daily report
- Low stock alerts

### Tech Stack
- Frontend: React (App.jsx)
- Backend: Supabase (Postgres, Auth, Realtime)
- Offline: IndexedDB / localStorage
- Deployment: Vercel / Netlify

### Getting Started

1. Clone
```bash
git clone https://github.com/Chizitelum0/pos-Transaction-app.git
cd pos-Transaction-app
npm install
