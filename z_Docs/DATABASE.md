# Database

## Technology

The current implementation uses MongoDB with Mongoose. The database connection is configured with `MONGO_URI`.

## Models

### User

File: `pos-app/models/User.js`

| Field | Type | Notes |
|---|---|---|
| `username` | String | Required, unique, trimmed |
| `password` | String | Required; created cashier passwords are bcrypt hashes |
| `role` | String | `Admin` or `Cashier`; defaults to `Cashier` |

### Item

File: `pos-app/models/Item.js`

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `price` | Number | Required |
| `stock` | Number | Defaults to 0 |

### Transaction

File: `pos-app/models/Transaction.js`

| Field | Type | Notes |
|---|---|---|
| `cashierName` | String | Required |
| `items` | Array | Embedded name, price, quantity |
| `totalAmount` | Number | Required |
| `timestamp` | Date | Defaults to creation time |

## Relationships

The models do not currently use MongoDB references. Transaction items are embedded snapshots.

```text
Transaction
  ├── cashierName
  ├── totalAmount
  └── items[]
       ├── name
       ├── price
       └── quantity

Item
  ├── name
  ├── price
  └── stock
```

Because transaction items store their own name and price, historical records do not depend on the product's current price.

## Stock updates

Checkout uses a conditional `findOneAndUpdate` requiring stock to be at least the requested quantity, then decrements stock with `$inc`.

## Consistency limitation

Checkout changes stock and then saves the transaction. If saving fails, the server attempts a compensating rollback.

This is not equivalent to a MongoDB database transaction. A future implementation can use a MongoDB session/transaction so inventory and transaction creation commit or fail together.

## Seed data

The `/api/items/seed` route deletes all existing items before inserting sample products. It must be treated as destructive development functionality.

## Production data concerns

Use controlled database credentials, backups, monitoring, and recovery procedures for any production deployment.
