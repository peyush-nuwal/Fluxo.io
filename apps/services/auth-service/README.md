# Auth Service

The Auth Service is responsible for identity, authentication, OTP workflows, OAuth, and user profile APIs.

## Default Port

- `4001`

## Base Path

- `/api/v1/auth`

## Core Capabilities

- Local auth: signup, signin, logout, token refresh
- OTP flows: verification, resend, status, cleanup
- Password flows: update, set initial password, forgot/reset
- Email change via OTP
- OAuth: Google and GitHub
- User profile APIs: current profile, public profile, username, avatar, visibility

## Auth Model

- Cookies issued by service:
  - `access_token`
  - `refresh_token`
- Gateway validates JWT and forwards identity headers for protected routes.

## Endpoint Groups

### Authentication

- `POST /signup`
- `POST /signin`
- `POST /logout`
- `GET /me`
- `GET /refresh`

### Password

- `POST /update-password`
- `POST /set-password`
- `POST /password/forgot-password`
- `POST /password/verify-reset-password-otp`
- `POST /password/reset`

### OTP

- `POST /otp/generate`
- `POST /otp/verify`
- `POST /otp/resend`
- `GET /otp/status`
- `GET /otp/test-email`
- `DELETE /otp/cleanup`

### Email Change

- `POST /email/change/request`
- `POST /email/change/verify`

### OAuth

- `GET /oauth/google`
- `GET /oauth/google/callback`
- `GET /oauth/github`
- `GET /oauth/github/callback`

### User Profile

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/username`
- `POST /users/me/upload-avatar`
- `PATCH /users/me/visibility`
- `GET /users/:id/profile`
- `POST /users/bulk-by-email` (internal service token required)

## Environment Variables

```env
PORT=4001
DATABASE_URL=YOUR-NEON-DB-URL
SUPABASE_URL=YOUR-SUPABASE-URL
SUPABASE_SERVICE_ROLE_KEY=YOUR-SUPABASE-ROLE-KEY
JWT_SECRET=YOUR-JWT-TOKEN
EMAIL_SERVICE=gmail
EMAIL_FROM=EMAIL-USER-ID
EMAIL_USER=EMAIL-YOU-WANT-SEND-MAIL-FROM
EMAIL_PASSWORD=your-email-password
EMAIL_DOMAIN=gmail.com
GOOGLE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID
GOOGLE_CLIENT_SECRET=YOUR-GOOGLE-CLIENT-SECRET
GOOGLE_CALLBACK_URL=YOUR-GOOGLE-CALLBACK-URL
GITHUB_CLIENT_ID=YOUR-GITHUB-CLIENT-ID
GITHUB_CLIENT_SECRET=YOUR-GITHUB-CLIENT-SECRET
GITHUB_CALLBACK_URL=YOUR-GITHUB-CALLBACK-URL
INTERNAL_SERVICE_TOKEN=LONG-RANDOM-SECRET
FRONTEND_URL=http://localhost:3000
```

## Run

```bash
pnpm -C apps/services/auth-service dev
pnpm -C apps/services/auth-service start
```

## Database Commands

```bash
pnpm -C apps/services/auth-service db:generate
pnpm -C apps/services/auth-service db:migrate
pnpm -C apps/services/auth-service db:studio
```

## Additional Docs

- [API_REFERENCE.md](./API_REFERENCE.md)
- [OTP_IMPLEMENTATION.md](./OTP_IMPLEMENTATION.md)
- [OTP_USAGE_EXAMPLE.md](./OTP_USAGE_EXAMPLE.md)
- [EMAIL_CONFIGURATION_GUIDE.md](./EMAIL_CONFIGURATION_GUIDE.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
