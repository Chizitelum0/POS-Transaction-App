# Architecture

## Overview

The application is a browser-based POS with two main runtime components:

1. **React/Vite frontend** in `client/pos/`
2. **Node.js/Express backend** in `pos-app/`

The backend connects to **MongoDB through Mongoose**.

```text
Browser
  |
  | React UI
  | /api requests
  v
Express API
  |
  | Mongoose
  v
MongoDB
```

## Frontend

The frontend is currently concentrated in `client/pos/src/App.jsx`. It handles login, token storage, inventory loading, product search, cart state, checkout requests, transaction history, receipt printing, daily report UI, admin cashier creation, and logout.

The frontend is functional but still contains a large amount of UI and application logic in one component. Refactoring into feature modules is planned.

## Backend

The backend entry point is `pos-app/server.js`.

It provides:

- JSON request parsing
- CORS
- JWT authentication middleware
- Admin authorization middleware
- Authentication
- Inventory APIs
- Transaction APIs
- Daily reporting
- Cashier creation
- Production frontend serving

MongoDB models are stored in `pos-app/models/`.

## Checkout request flow

```text
User selects products
      |
      v
React cart state
      |
      v
POST /api/transactions
      |
      v
JWT authentication
      |
      v
Validate submitted items and total
      |
      v
Decrement inventory
      |
      v
Create transaction document
      |
      v
Return saved transaction
```

## Authentication flow

```text
Username + password
        |
        v
POST /api/auth/login
        |
        v
MongoDB user lookup
        |
        v
bcrypt password comparison
        |
        v
JWT issued
        |
        v
Frontend stores token
        |
        v
Bearer token on protected requests
```

## Authorization

- **Admin:** administrative operations such as adding products, seeding inventory, viewing daily reports, and creating cashiers.
- **Cashier:** normal authenticated POS operations without admin-only access.

## Current limitations

- Most frontend logic is still in `App.jsx`.
- Checkout uses manual stock rollback rather than a MongoDB database transaction.
- Transaction totals and item prices are submitted by the client after basic validation.
- Receipt business configuration is browser-local.
- Automated tests are not yet part of the repository workflow.
- JWTs are stored in browser local storage.

## Planned improvements

- Split frontend features into modules/components.
- Derive transaction totals from trusted server-side product data.
- Use database transactions for checkout consistency.
- Add centralized business/tenant configuration.
- Add automated API/integration tests.
- Improve production authentication/session handling.
