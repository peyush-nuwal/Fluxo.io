# 📚 API Reference

Complete API documentation for the Auth Service endpoints, including request/response formats, error codes, and examples.

## 🔗 Base URL

```
Development: http://localhost:3001
Production: https://auth.fluxo.io
```

## 🔐 Authentication

Most endpoints require JWT authentication via:

- **Cookie**: `token` cookie (preferred)
- **Header**: `Authorization: Bearer <jwt_token>`

## 📋 Response Format

All responses follow this format:

```json
{
  "message": "Success message",
  "data": {
    /* response data */
  },
  "error": "Error type",
  "details": {
    /* error details */
  }
}
```

## 🚀 Authentication Endpoints

### Register User

Create a new user account with email verification.

```http
POST /api/v1/auth/signup
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**

- `name`: 2-255 characters, required
- `email`: Valid email format, required
- `password`: 6-128 characters, required

**Success Response (201):**

```json
{
  "message": "User registered successfully. A verification OTP has been sent to your email.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified": false
  },
  "requiresEmailVerification": true
}
```

**Error Responses:**

- `400`: Validation failed
- `409`: User already exists
- `503`: Email service unavailable

---

### Sign In

Authenticate user with email and password.

```http
POST /api/v1/auth/signin
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Sign in success",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified": true
  }
}
```

**Error Responses:**

- `400`: Validation failed
- `401`: Invalid credentials
- `403`: Email not verified
- `404`: User not found

---

### Sign Out

Sign out the current user and clear authentication cookie.

```http
POST /api/v1/auth/signout
```

**Success Response (200):**

```json
{
  "message": "User signed out successfully"
}
```

---

### Update Password

Change user password (requires authentication).

```http
POST /api/v1/auth/update-password
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Password changed successfully",
  "token": "new-jwt-token"
}
```

**Error Responses:**

- `400`: Validation failed
- `401`: Invalid token or incorrect old password
- `404`: User not found

## 🔢 OTP Endpoints

### Generate OTP

Generate and send OTP for various purposes.

```http
POST /api/v1/auth/otp/generate
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

**Valid Purposes:**

- `email_verification`: Verify email during registration
- `password_reset`: Reset password
- `email_change`: Change email address
- `two_factor`: Two-factor authentication

**Success Response (200):**

```json
{
  "message": "OTP sent successfully",
  "expiresIn": 600
}
```

**Error Responses:**

- `400`: Validation failed
- `404`: User not found
- `503`: Email service unavailable

---

### Verify OTP

Verify OTP code for specified purpose.

```http
POST /api/v1/auth/otp/verify
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "otpCode": "123456",
  "purpose": "email_verification"
}
```

**Success Response (200):**

```json
{
  "message": "OTP verified successfully",
  "emailVerified": true
}
```

**Error Responses:**

- `400`: Invalid/expired OTP, validation failed
- `404`: User not found
- `429`: Too many attempts

---

### Resend OTP

Resend OTP to user's email.

```http
POST /api/v1/auth/otp/resend
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

**Success Response (200):**

```json
{
  "message": "OTP resent successfully",
  "expiresIn": 600
}
```

---

### Get OTP Status

Get current OTP status for authenticated user.

```http
GET /api/v1/auth/otp/status?purpose=email_verification
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `purpose`: OTP purpose (required)

**Success Response (200):**

```json
{
  "status": {
    "hasActiveOTP": true,
    "isExpired": false,
    "attemptsRemaining": 2,
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Cleanup Expired OTPs

Remove expired OTPs from database (admin utility).

```http
DELETE /api/v1/auth/otp/cleanup
```

**Success Response (200):**

```json
{
  "message": "Expired OTPs cleaned up successfully",
  "deletedCount": 15
}
```

---

### Test Email Configuration

Test email service configuration.

```http
GET /api/v1/auth/otp/test-email
```

**Success Response (200):**

```json
{
  "message": "Email configuration is working correctly",
  "success": true,
  "configuration": {
    "fromName": "Fluxo.io",
    "fromAddress": "Fluxo.io <your-email@gmail.com>",
    "authUser": "your-email@gmail.com",
    "service": "gmail"
  }
}
```

## 📧 Email Change Endpoints

### Request Email Change

Request to change user's email address.

```http
POST /api/v1/auth/email/change/request
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "newEmail": "newemail@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "OTP sent to new email for verification",
  "expiresIn": 600
}
```

**Error Responses:**

- `400`: Validation failed, same email
- `401`: Invalid token
- `404`: User not found

---

### Verify Email Change

Verify OTP and change email address.

```http
POST /api/v1/auth/email/change/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "newEmail": "newemail@example.com",
  "otpCode": "123456"
}
```

**Success Response (200):**

```json
{
  "message": "Email changed successfully"
}
```

**Error Responses:**

- `400`: Invalid/expired OTP, validation failed
- `401`: Invalid token
- `404`: User not found
- `409`: Email already in use

## 🔑 Password Reset Endpoints

### Forgot Password

Initiate password reset process.

```http
POST /api/v1/auth/password/forgot-password
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "Password reset OTP sent successfully",
  "expiresIn": 600
}
```

**Error Responses:**

- `400`: Validation failed
- `404`: User not found
- `503`: Email service unavailable

---

### Verify Password Reset OTP

Verify OTP for password reset (Step 1 of 2).

```http
POST /api/v1/auth/password/verify-reset-password-otp
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

**Success Response (200):**

```json
{
  "message": "OTP verified successfully. You can now reset your password.",
  "verified": true,
  "resetToken": "jwt-reset-token"
}
```

**Error Responses:**

- `400`: Invalid/expired OTP, validation failed
- `404`: User not found
- `429`: Too many attempts

---

### Reset Password

Reset password using reset token (Step 2 of 2).

```http
POST /api/v1/auth/password/reset
Content-Type: application/json
```

**Request Body:**

```json
{
  "resetToken": "jwt-reset-token",
  "newPassword": "newPassword123"
}
```

**Success Response (200):**

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**

- `400`: Validation failed
- `401`: Invalid/expired reset token
- `404`: User not found

## 📊 Error Codes

### HTTP Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |
| 503  | Service Unavailable   |

### Error Types

| Error                       | Description                      |
| --------------------------- | -------------------------------- |
| `validation failed`         | Input validation error           |
| `User already exists`       | Email already registered         |
| `User not found`            | No account with email            |
| `Invalid credentials`       | Wrong email/password             |
| `Email not verified`        | Email verification required      |
| `Invalid or expired OTP`    | OTP verification failed          |
| `OTP has expired`           | OTP time limit exceeded          |
| `Too many attempts`         | Max attempts exceeded            |
| `Email already in use`      | Email taken by another user      |
| `Email service unavailable` | Email sending failed             |
| `Invalid or expired token`  | JWT token invalid                |
| `Social login account`      | Cannot change password for OAuth |

## 🔧 Rate Limits

### API Gateway Level (Arcjet)

- **5 requests per 2 seconds** per IP address
- **Bot detection** and blocking
- **Shield protection** against attacks

### Auth Service Level

- **3 OTP attempts** per OTP code
- **10-minute expiration** for OTPs
- **Email sending limits** to prevent spam

## 🧪 Testing

### Test Endpoints

Use these endpoints for testing:

```bash
# Test email configuration
GET /api/v1/auth/otp/test-email

# Cleanup expired OTPs
DELETE /api/v1/auth/otp/cleanup

# Health check
GET /health
```

### Example cURL Commands

```bash
# Register user
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Sign in
curl -X POST http://localhost:3001/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Generate OTP
curl -X POST http://localhost:3001/api/v1/auth/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","purpose":"email_verification"}'

# Verify OTP
curl -X POST http://localhost:3001/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","otpCode":"123456","purpose":"email_verification"}'
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- JWT tokens expire after 1 day
- OTPs expire after 10 minutes
- Email addresses are normalized (lowercase, trimmed)
- Passwords are hashed using bcrypt
- All endpoints support CORS
- Rate limiting is applied at API Gateway level

---

For more detailed examples and integration guides, see:

- [OTP Usage Examples](./OTP_USAGE_EXAMPLE.md)
- [Email Verification Flow](./EMAIL_VERIFICATION_FLOW.md)
- [Email Configuration Guide](./EMAIL_CONFIGURATION_GUIDE.md)
