# OTP (One-Time Password) Implementation

This document describes the OTP functionality added to the auth-service.

## Overview

The OTP service provides secure one-time password generation and verification for various authentication purposes including:

- Email verification
- Password reset
- Login verification
- Two-factor authentication

## Features

- ✅ Generate 6-digit numeric OTPs
- ✅ Email delivery via Nodemailer
- ✅ OTP expiration (10 minutes)
- ✅ Rate limiting (max 3 verification attempts)
- ✅ Automatic cleanup of expired OTPs
- ✅ Multiple OTP purposes support
- ✅ Secure storage with attempt tracking

## API Endpoints

### 1. Generate OTP

```
POST /api/v1/auth/otp/generate
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "email_verification" // optional, defaults to "email_verification"
}
```

**Response:**

```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

### 2. Verify OTP

```
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otpCode": "123456",
  "purpose": "email_verification"
}
```

**Response:**

```json
{
  "message": "OTP verified successfully"
}
```

### 3. Resend OTP

```
POST /api/v1/auth/otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

### 4. Get OTP Status

```
GET /api/v1/auth/otp/status?purpose=email_verification
Authorization: Bearer <jwt_token>
```

### 5. Cleanup Expired OTPs (Admin)

```
DELETE /api/v1/auth/otp/cleanup
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE="gmail"  # or "outlook", "yahoo", etc.
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"  # Use app password for Gmail
EMAIL_FROM="your-email@gmail.com"  # Optional, defaults to EMAIL_USER
```

## Database Migration

Run the migration to create the OTP table:

```bash
cd apps/auth-service
pnpm db:migrate
```

## OTP Purposes

- `email_verification`: Verify user email during registration
- `password_reset`: Reset user password
- `login`: Two-factor authentication during login
- `two_factor`: General 2FA verification

## Security Features

1. **Expiration**: OTPs expire after 10 minutes
2. **Rate Limiting**: Maximum 3 verification attempts per OTP
3. **One-time Use**: Each OTP can only be used once
4. **Secure Storage**: OTPs are hashed and stored securely
5. **Automatic Cleanup**: Expired OTPs are automatically removed

## Usage Examples

### Email Verification Flow

```javascript
// 1. Generate OTP
const response = await fetch("/api/v1/auth/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    purpose: "email_verification",
  }),
});

// 2. User receives email with OTP

// 3. Verify OTP
const verifyResponse = await fetch("/api/v1/auth/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    otpCode: "123456",
    purpose: "email_verification",
  }),
});
```

### Password Reset Flow

```javascript
// 1. Generate OTP for password reset
const response = await fetch("/api/v1/auth/otp/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    purpose: "password_reset",
  }),
});

// 2. Verify OTP
const verifyResponse = await fetch("/api/v1/auth/otp/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    otpCode: "123456",
    purpose: "password_reset",
  }),
});

// 3. Proceed with password reset after successful verification
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400`: Invalid input or expired OTP
- `404`: User not found
- `429`: Maximum verification attempts exceeded
- `500`: Internal server error

## Dependencies Added

- `nodemailer`: Email sending functionality
- `@types/nodemailer`: TypeScript types for nodemailer

## Files Created/Modified

### New Files:

- `src/models/otp.model.js` - OTP database model
- `src/service/otp.service.js` - OTP business logic
- `src/controller/otp.controller.js` - OTP API controllers

### Modified Files:

- `src/routes/auth.route.js` - Added OTP routes
- `packages/zod-schemas/src/auth-schema/authSchemas.js` - Added OTP validation schemas
- `drizzle.config.js` - Updated to include OTP model
- `package.json` - Added nodemailer dependencies

### Database:

- `drizzle/0001_cold_bromley.sql` - Migration for OTP table
