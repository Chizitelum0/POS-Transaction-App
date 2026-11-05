# Transactions

## Checkout workflow

```text
Select product
    |
    v
Add/update cart quantity
    |
    v
POST /api/transactions
    |
    v
Authenticate request
    |
    v
Validate items and total
    |
    v
Check/decrement inventory
    |
    v
Create Transaction document
    |
    v
Return saved transaction
```

## Server-side validation

Each submitted item is checked for a non-empty product name, integer quantity greater than zero, finite price, and non-negative price. The submitted total must also be finite and non-negative.

## Duplicate product lines

The backend combines quantities by product name before checking stock.

## Stock deduction

For each product, the backend conditionally updates the item only when available stock is at least the requested quantity, then decrements stock with `$inc`.

## Transaction persistence

A saved transaction contains cashier name, item name, item price, quantity, total amount, and timestamp.

## Failure recovery

If saving the transaction fails after stock changes, the server attempts to increment the affected inventory back to its previous quantity.

This is a compensating rollback rather than an atomic database transaction. A process crash or another failure during the gap could still produce inconsistent state.

## Receipt relationship

The frontend can derive a receipt identifier from the saved transaction ID. Reprinting an existing transaction does not create a new sale.

## Daily reporting

The daily report retrieves today's transactions and calculates total transaction count and total revenue. Transactions are sorted newest first.

## Current limitations

- The server accepts the submitted total rather than deriving it from trusted database prices.
- Item prices are supplied by the client.
- No payment-method field exists in the current Transaction model.
- No tax/discount model exists in the backend.
- Inventory and transaction persistence are not wrapped in a database transaction.

These are important areas for future engineering work.
