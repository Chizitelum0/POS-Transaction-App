# POS Transaction App Documentation

This directory contains the technical documentation for the current implementation of the POS Transaction App.

## Documentation map

| Document | Purpose |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Application architecture, request flow, and current limitations |
| [API.md](./API.md) | HTTP endpoints, authentication requirements, request and response behaviour |
| [DATABASE.md](./DATABASE.md) | MongoDB/Mongoose models and data relationships |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Login, JWT authentication, roles, and password handling |
| [TRANSACTIONS.md](./TRANSACTIONS.md) | Checkout, stock changes, transaction persistence, and failure recovery |
| [INVENTORY.md](./INVENTORY.md) | Product management, stock rules, search, and seed data |
| [RECEIPTS.md](./RECEIPTS.md) | 80 mm-style receipt printing, business profile, and reprinting |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Environment variables, frontend/backend deployment, and production considerations |

## Current implementation

The application is currently a React/Vite frontend backed by an Express API and MongoDB through Mongoose.

**Important:** These documents describe what the repository actually implements today. Planned improvements are clearly labelled as future work. Features such as offline synchronization, Supabase/PostgreSQL storage, WhatsApp receipt delivery, multiple payment methods, and low-stock alerts are not documented as current features because they are not implemented in the current codebase.

## Project purpose

The POS is a practical engineering and learning project focused on:

- Backend API development
- Authentication and authorization
- Database modelling
- Inventory operations
- Transaction workflows
- Error handling and rollback logic
- Frontend/backend integration
- Practical software architecture

> Build the foundation correctly. Then build on it.
