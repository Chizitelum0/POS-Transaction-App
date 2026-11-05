# API Reference

Development API base URL: `http://localhost:5000`

The frontend normally reaches the backend through the Vite `/api` proxy.

## Authentication

Protected endpoints expect:

```http
Authorization: Bearer <jwt-token>
```

Missing, malformed, invalid, or expired tokens return HTTP 401. Admin-only endpoints return HTTP 403 for non-admin users.

## POST /api/auth/login

Authenticate a user.

### Request

```json
{
  "username": "username",
  "password": "password"
}
```

Returns a JWT and basic user information.

## GET /api/items

Returns inventory sorted by product name.

**Authentication:** Required.

## POST /api/items

Creates a product.

**Authentication:** Admin only.

```json
{
  "name": "Product",
  "price": 1000,
  "stock": 20
}
```

The server requires a non-empty name, finite non-negative price, and whole-number non-negative stock.

## POST /api/items/seed

Deletes existing inventory and inserts sample products.

**Authentication:** Admin only.

**Warning:** Destructive development functionality.

## POST /api/transactions

Records a sale and updates inventory.

**Authentication:** Required.

```json
{
  "cashierName": "username",
  "items": [
    {
      "name": "Product",
      "price": 1000,
      "quantity": 2
    }
  ],
  "totalAmount": 2000
}
```

The server validates item lines and total, combines duplicate product names for stock checking, decrements stock, creates the transaction, and attempts to restore stock if saving fails.

## GET /api/transactions

Returns transaction history, newest first.

**Authentication:** Required.

Optional query parameters: `startDate` and `endDate`.

Example:

`GET /api/transactions?startDate=2026-11-01&endDate=2026-11-05`

## GET /api/reports/daily

Returns today's transaction count, revenue, and transaction records.

**Authentication:** Admin only.

## POST /api/users

Creates a cashier account.

**Authentication:** Admin only.

```json
{
  "username": "cashier01",
  "password": "password"
}
```

The password is hashed with bcrypt before storage.

## Error pattern

Most API errors use:

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

Unexpected failures are normally returned with a generic client-facing message while details are logged server-side.
