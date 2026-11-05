# Authentication and Authorization

## Stack

The application uses username/password login, bcrypt password hashing, JSON Web Tokens (JWT), and role-based authorization.

## Login flow

1. User submits username and password.
2. Frontend sends credentials to `POST /api/auth/login`.
3. Server looks up the user and compares the password with bcrypt.
4. Server signs a JWT containing user ID, username, and role.
5. Frontend stores the token and user information.
6. Protected requests send the JWT as a Bearer token.

## JWT

Tokens are signed with `JWT_SECRET` and currently expire after **8 hours**. The payload contains `userId`, `username`, and `role`.

## Authorization

`requireAuth` validates the Bearer token and sets `req.user`.

`requireAdmin` requires `req.user.role === 'Admin'`.

Admin-only operations are:

- add product
- seed inventory
- daily sales report
- create cashier

Invalid/expired tokens return HTTP 401. Non-admin users attempting admin routes receive HTTP 403.

## Password handling

Cashier passwords created through the API are hashed with bcrypt before storage. Plaintext passwords should never be stored.

## Browser token storage

The current frontend stores the JWT in browser local storage. This is simple for a learning project but has security trade-offs if an XSS vulnerability exists. A production architecture should evaluate stronger session/token handling.

## Bootstrap administrator

The backend contains a startup bootstrap path for a default administrator. Before real deployment, replace this source-code credential mechanism with a secure initialization process.

Default credentials are intentionally not reproduced in this documentation.

## Deployment requirements

- Set a strong private `JWT_SECRET`.
- Never commit `.env` files or production credentials.
- Review token storage and session strategy before production use.
