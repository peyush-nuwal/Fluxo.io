# Auth Service API Reference

Base URL (local): `http://localhost:4001/api/v1/auth`

When accessed through gateway: `http://localhost:4000/api/v1/auth`

## Response Envelope

Most handlers use:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

## Authentication Endpoints

### POST `/signup`

Create a new local user and trigger email verification OTP.

Request:

```json
{
  "userName": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Success `200`:

```json
{
  "success": true,
  "message": "User registered. OTP sent for verification",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "user_name": "johndoe",
      "avatar_url": null,
      "email": "john@example.com",
      "email_verified": false
    },
    "requiresEmailVerification": true
  }
}
```

### POST `/signin`

Authenticate user and set auth cookies.

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Success `200`: user payload in `data.user`.

### POST `/logout`

Clears `access_token` and `refresh_token` cookies.

### GET `/me`

Returns current user from `access_token` cookie.

### GET `/refresh`

Uses `refresh_token` cookie and issues a new `access_token` cookie.

## Password Endpoints

### POST `/update-password`

Requires `access_token` cookie.

Request:

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### POST `/set-password`

For social accounts without existing local password.

Request:

```json
{
  "newPassword": "newPassword123"
}
```

## OTP Endpoints

### POST `/otp/generate`

Request:

```json
{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

Purposes:

- `email_verification`
- `email_change`
- `password_reset`
- `login`
- `two_factor`

### POST `/otp/verify`

Request:

```json
{
  "email": "john@example.com",
  "otpCode": "123456",
  "purpose": "email_verification"
}
```

### POST `/otp/resend`

Same payload shape as `/otp/generate`.

### GET `/otp/status?purpose=email_verification`

Returns OTP state for authenticated user.

### GET `/otp/test-email`

Checks email transport configuration.

### DELETE `/otp/cleanup`

Admin utility to remove expired OTP records.

## Email Change (OTP)

### POST `/email/change/request`

Requires `access_token` cookie.

Request:

```json
{
  "newEmail": "new@example.com"
}
```

### POST `/email/change/verify`

Requires `access_token` cookie.

Request:

```json
{
  "newEmail": "new@example.com",
  "otpCode": "123456"
}
```

## Password Reset (OTP)

### POST `/password/forgot-password`

Request:

```json
{
  "email": "john@example.com"
}
```

### POST `/password/verify-reset-password-otp`

Request:

```json
{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

Success returns `resetToken`.

### POST `/password/reset`

Request:

```json
{
  "resetToken": "token-from-previous-step",
  "newPassword": "newPassword123"
}
```

## OAuth Endpoints

- `GET /oauth/google`
- `GET /oauth/google/callback`
- `GET /oauth/github`
- `GET /oauth/github/callback`

Callback routes set auth cookies and redirect to `${FRONTEND_URL}/oauth-success`.

## User Profile Endpoints

### GET `/users/me`

Returns current user profile.

### PATCH `/users/me`

Updates profile fields. Supports multipart with optional avatar file.

### PATCH `/users/me/username`

Request:

```json
{
  "user_name": "new_username"
}
```

### POST `/users/me/upload-avatar`

Multipart avatar upload endpoint.

### PATCH `/users/me/visibility`

Request:

```json
{
  "make_public": true
}
```

### GET `/users/:id/profile`

Returns public profile for user id.

### POST `/users/bulk-by-email`

Internal endpoint used by diagram service.

Headers:

- `x-internal-service-token: <INTERNAL_SERVICE_TOKEN>`

Request:

```json
{
  "emails": ["a@example.com", "b@example.com"]
}
```

## Common Error Codes

- `400` validation failure / bad payload
- `401` unauthorized or missing/invalid token
- `403` forbidden (e.g., email not verified)
- `404` resource/user not found
- `409` conflict (email/username already in use)
- `429` OTP attempt limit reached
- `500` internal server error
- `503` email service unavailable

## Health

- `GET /health`
