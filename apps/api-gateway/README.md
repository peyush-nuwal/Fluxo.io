# API Gateway

The API Gateway is the unified entrypoint for Fluxo backend APIs.

## Default Port

- `4000`

## Responsibilities

- Validates JWT for protected endpoints
- Proxies requests to backend microservices
- Forwards identity headers to downstream services
- Preserves auth cookies set by auth service

## Upstream Services

Configured in `src/config.js`:

- Auth: `AUTH_SERVICE_URL` (default `http://localhost:4001`)
- Diagram: `DIAGRAM_SERVICE_URL` (default `http://localhost:4002`)
- AI: `AI_SERVICE_URL` (default `http://localhost:4004`)
- Subscription: `SUBSCRIPTION_SERVICE_URL` (default `http://127.0.0.1:4006`)

## Gateway Routes

### Auth

- Base: `/api/v1/auth/*`
- Proxied to Auth Service as-is.

### Diagram

- `/api/v1/diagram/projects/*`
- `/api/v1/diagram/diagrams/*`
- `/api/v1/diagram/invitations/*`
- `/api/v1/diagram/admin/*`

Also mounted as backward-compatible aliases:

- `/api/v1/projects/*`
- `/api/v1/diagrams/*`
- `/api/v1/invitations/*`

### AI

- Base: `/api/v1/ai/*`
- Path preserved and proxied to AI Service.

### Subscription

- Gateway mount: `/api/v1/subscription/*`
- Proxy router currently mounted under `/subscription` inside the gateway route module.
- Effective proxied path pattern today: `/api/v1/subscription/subscription/*`

## Public Paths (No JWT)

Gateway allows these without token:

- `/api/v1/auth/signup`
- `/api/v1/auth/signin`
- `/api/v1/auth/logout`
- `/api/v1/auth/refresh`
- `/api/v1/auth/otp/verify`
- `/api/v1/auth/otp/generate`
- `/api/v1/auth/password/forgot-password`
- `/api/v1/auth/password/verify-reset-password-otp`
- `/api/v1/auth/password/reset`
- `/api/v1/auth/oauth/google`
- `/api/v1/auth/oauth/google/callback`
- `/api/v1/auth/oauth/github`
- `/api/v1/auth/oauth/github/callback`
- `/health`

All other API paths are protected.

## Health

- `GET /health` -> `{ status: "ok" }`

## Environment Variables

Example (`.env.example`):

```env
NODE_ENV=development
JWT_SECRET=YOUR-JWT-TOKEN
ARCJET_KEY=YOUR-ARCJET-KEY
```

Additional optional service URL overrides:

```env
PORT=4000
AUTH_SERVICE_URL=http://localhost:4001
DIAGRAM_SERVICE_URL=http://localhost:4002
AI_SERVICE_URL=http://localhost:4004
SUBSCRIPTION_SERVICE_URL=http://127.0.0.1:4006
ACCESS_TOKEN_SECRET=your-access-token-secret
```

## Run

```bash
pnpm -C apps/api-gateway dev
pnpm -C apps/api-gateway start
```
