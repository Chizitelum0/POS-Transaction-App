# POS Transaction App

A browser-based point-of-sale application built as a practical software engineering project. It demonstrates core retail checkout workflows, inventory management, cashier authentication, transaction recording, printable receipts, and daily sales reporting.

> **Project status:** In development. The repository documents the current implementation; some architectural improvements are planned.

## Overview

The application provides a POS interface for a small retail workflow:

- Cashier and administrator login
- Role-based access for administrative operations
- Product inventory listing and product creation
- Product search and cart management
- Checkout with transaction persistence and stock updates
- Transaction history with receipt reprinting
- Printable 80 mm-style sales receipts with configurable business details stored in the browser
- Administrator daily sales report
- Cashier account creation by an administrator

The application formats sales amounts in Nigerian naira (NGN).

## Current Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password hashing | bcrypt |
| Development tooling | npm, Vite, nodemon, Oxlint |

**Database note:** The current backend uses MongoDB and Mongoose. PostgreSQL is a possible future direction, but a migration has not been implemented.

## Repository Structure

```text
POS-Transaction-App/
├── client/
│   └── pos/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
├── pos-app/
│   ├── models/
│   │   ├── Item.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── package.json
│   └── server.js
└── z_Docs/
```

The React application currently has most of its interface and client-side logic in `client/pos/src/App.jsx`. The backend API and startup logic are in `pos-app/server.js`.

## Getting Started

### Prerequisites

- Node.js
- npm
- A MongoDB database (local or hosted)

### 1. Clone the repository

```bash
git clone https://github.com/Chizitelum0/POS-Transaction-App.git
cd POS-Transaction-App
```

### 2. Configure the backend

Install backend dependencies:

```bash
cd pos-app
npm install
```

Create a `.env` file inside `pos-app/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

Start the API in development mode:

```bash
npm run dev
```

The Vite development proxy is configured to forward `/api` requests to `http://localhost:5000`.

### 3. Start the frontend

Open a second terminal:

```bash
cd client/pos
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

### 4. Production build

From `client/pos/`, run:

```bash
npm run build
```

The backend is configured to serve the built frontend from `client/pos/dist`. For a single-server deployment, build the frontend and configure the hosting environment with `MONGO_URI`, `JWT_SECRET`, and `PORT`.

## API Overview

The current Express API includes these routes:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/items` | Retrieve inventory |
| POST | `/api/items` | Add a product (Admin) |
| POST | `/api/items/seed` | Replace inventory with sample products (Admin) |
| POST | `/api/transactions` | Record a sale and update stock |
| GET | `/api/transactions` | Retrieve transaction history |
| GET | `/api/reports/daily` | Retrieve the daily sales report (Admin) |
| POST | `/api/users` | Create a cashier account (Admin) |

Protected routes require a bearer token issued at login.

## Important Notes

- The sample inventory seed endpoint deletes the existing inventory before inserting sample products. Do not call it against data you need to keep.
- Review and replace the default administrator bootstrap credentials in the backend before deploying this project for real use.
- Configure a strong, private `JWT_SECRET` and keep environment files out of version control.
- This is a learning and portfolio project, not a production-certified point-of-sale or accounting system.
- The current checkout logic updates stock and attempts to restore it if saving a transaction fails. A database transaction-based implementation is a planned reliability improvement.

## Roadmap

- Refactor the large React entry component into maintainable feature modules.
- Improve API validation, error handling, and automated test coverage.
- Strengthen transaction consistency using database transactions.
- Improve deployment configuration and operational security.
- Evaluate a future migration from MongoDB to PostgreSQL.

## Project Purpose

This project is part of my ongoing work to develop practical skills in backend engineering, API design, authentication, database operations, and transaction workflows.

---

**Build the foundation correctly. Then build on it.**
