# Deployment

## Runtime components

The application can be deployed as a Node.js/Express backend, MongoDB database, and React/Vite frontend. The backend also contains logic to serve the production frontend build from `client/pos/dist`, supporting a single-server deployment model.

## Environment variables

The backend expects:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

## Development

Backend:

```bash
cd pos-app
npm install
npm run dev
```

Frontend:

```bash
cd client/pos
npm install
npm run dev
```

The Vite server proxies `/api` requests to `http://localhost:5000`.

## Production build

From `client/pos/`:

```bash
npm run build
```

The generated frontend is placed in `client/pos/dist`.

## Deployment checklist

Before deployment:

- Set a strong `JWT_SECRET`.
- Set a production MongoDB connection string.
- Replace the source-code bootstrap admin credential mechanism.
- Review CORS configuration.
- Use HTTPS.
- Do not commit `.env` or secrets.
- Back up the database.
- Disable or restrict the destructive inventory seed endpoint.
- Review logging and error handling.
- Test checkout consistency under concurrent requests.
- Test receipt printing on intended hardware.

## Security hardening still needed

This is a learning/portfolio project rather than a production-certified POS. Further work should address authentication/session storage, API rate limiting, stronger validation, CSRF/XSS considerations, audit logging, database transaction handling, monitoring, secrets management, and backup/recovery procedures.

## Hosting

No specific hosting provider is required by the codebase. A Node-compatible host and managed MongoDB service can be used if they support the application's runtime, environment variables, networking, and database connectivity.
