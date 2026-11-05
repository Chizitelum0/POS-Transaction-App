# Receipts

## Receipt format

The frontend includes an **80 mm-style printable receipt** designed for browser printing.

It includes:

- business name
- optional address
- optional phone number
- receipt number
- date/time
- cashier
- sold items
- quantities
- item prices
- total amount
- thank-you message

## Business profile

Receipt business settings are stored in browser local storage under `posBusinessProfile`.

The current implementation provides a default business name and optional address/phone fields. This configuration is local to the browser and is not stored in MongoDB or automatically shared between devices.

## Receipt numbering

The frontend uses the saved transaction identifier when available and falls back to a generated POS identifier when necessary.

## Printing

The frontend opens a browser print window and renders receipt markup for printing. The implementation opens the window before completing the transaction request where needed to reduce popup/print blocking.

## Reprinting

Transaction history includes a reprint action. A saved transaction can be rendered again without creating a new transaction.

## Important distinction

Receipt printing is a presentation layer. It does not create the financial transaction itself. The backend transaction record remains the source of sale data used by the receipt UI.

## Current limitations

- Business profile settings are browser-local.
- No server-side receipt template configuration exists.
- No direct WhatsApp delivery is implemented.
- No fiscal/tax compliance workflow is implemented.
- Physical thermal-printer compatibility has not been formally tested across printer models.

Receipt formatting and local compliance requirements should be validated before real-world deployment.
