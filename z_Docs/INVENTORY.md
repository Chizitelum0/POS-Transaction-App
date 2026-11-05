# Inventory

## Inventory model

Products use the Mongoose `Item` model with `name`, `price`, and `stock`.

## Loading inventory

Authenticated users call `GET /api/items`. The backend sorts products alphabetically by name.

## Adding products

Admins create products through `POST /api/items`. The backend validates non-empty product name, finite non-negative price, and whole-number non-negative stock.

## Searching

The frontend provides client-side search over the inventory loaded into the browser. There is currently no dedicated backend search endpoint.

## Cart and stock

Selecting a product adds it to the frontend cart. Quantity changes happen in cart state. Final stock availability is checked again by the backend during checkout because browser inventory data can become stale when multiple users/devices use the application.

## Seed inventory

`POST /api/items/seed` deletes existing inventory and inserts sample products. This endpoint is destructive and should not be part of a normal production workflow.

## Current limitations

The current backend does not implement:

- low-stock alerts
- stock-adjustment history
- supplier/purchase workflows
- SKU/barcode fields
- product update/delete routes
- a stock movement ledger

Product names are also used for transaction stock matching.

## Future improvements

A stronger inventory subsystem could add stable product IDs in checkout, stock movement history, purchasing/receiving, low-stock thresholds, SKU/barcode support, audit history, and safer product update/delete operations.
