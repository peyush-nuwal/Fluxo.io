# Fluxo.io Architecture

## Current Topology

Fluxo uses an API Gateway in front of independently deployable backend services.

```text
Web Client (Next.js)
    |
    v
API Gateway (Express, :4000)
    |-- Auth Service (:4001)
    |-- Diagram Service (:4002)
    |-- AI Service (:4004)
    \-- Subscription Service (:4006)
```

## Responsibilities

### Web App (`apps/web`)

- User-facing UI and dashboard flows.
- Calls internal API routes that proxy to the gateway.
- Handles client auth state and settings UI.

### API Gateway (`apps/api-gateway`)

- Single API entrypoint for clients.
- JWT verification middleware.
- Proxies traffic to downstream services.
- Adds trusted identity headers for services (`x-user-id`, `x-user-email`).

### Auth Service (`apps/services/auth-service`)

- Signup/signin/logout/refresh.
- OTP flows (email verification, email change, password reset).
- OAuth (Google, GitHub).
- User profile and username update APIs.

### Diagram Service (`apps/services/diagram-service`)

- Projects and diagrams CRUD.
- Likes, visibility, active status, soft delete/restore.
- Collaborator management and invitation acceptance.
- Uses Redis for collaboration/profile caching.

### AI Service (`apps/services/ai-service`)

- Prompt-to-diagram generation endpoint.
- Integrates with Google Gemini.

### Subscription Service (`apps/services/subscription-service`)

- Razorpay order creation.
- Payment signature verification and subscription status updates.

## Request Flow

1. Client sends request to API Gateway (`/api/v1/...`).
2. Gateway verifies JWT (except public routes).
3. Gateway forwards request to target service.
4. Gateway injects user context headers where needed.
5. Service returns JSON response.

## Routing Map

- `/api/v1/auth/*` -> Auth Service
- `/api/v1/diagram/*` -> Diagram Service (rewritten upstream to `/api/v1/*`)
- `/api/v1/projects/*`, `/api/v1/diagrams/*`, `/api/v1/invitations/*` -> Diagram Service (compat aliases)
- `/api/v1/ai/*` -> AI Service
- `/api/v1/subscription/*` -> Subscription Service

## Data & Integrations

- PostgreSQL (primary persistence for auth, diagrams, subscription)
- Redis (diagram service caching and collaboration support)
- Supabase Storage (avatar/thumbnail upload flows)
- Google Gemini (`@google/genai`) for AI generation
- Razorpay for payments

## Security Model

- Gateway verifies JWT from cookie or bearer token.
- Downstream services trust gateway-provided identity headers.
- Auth cookies: `access_token`, `refresh_token`.
- Helmet + CORS + request logging enabled across services.

## Environment Strategy

Each app/service owns its `.env` file with its own `.env.example`. Keep secrets out of source control and ensure the same `INTERNAL_SERVICE_TOKEN` is shared where cross-service internal auth is required.
