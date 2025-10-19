# 🔐 Auth Service

A comprehensive, production-ready authentication service built with Node.js, Express, and PostgreSQL. This service provides secure user authentication, email verification, password management, and OTP-based security features.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🔑 Core Authentication

- ✅ **User Registration** with email verification
- ✅ **User Login** with JWT tokens
- ✅ **Password Management** (change, reset)
- ✅ **Email Verification** via OTP
- ✅ **Secure Cookie Handling**
- ✅ **Social Login Support** (Google, GitHub)

### 🛡️ Security Features

- ✅ **OTP-based Email Verification** (6-digit codes)
- ✅ **Password Reset** via OTP
- ✅ **Email Change** via OTP verification
- ✅ **Rate Limiting** (3 attempts per OTP)
- ✅ **JWT Token Management**
- ✅ **Password Hashing** (bcrypt)
- ✅ **Input Validation** (Zod schemas)
- ✅ **Security Headers**

### 📧 Email Services

- ✅ **Nodemailer Integration**
- ✅ **Multiple Email Providers** (Gmail, Outlook, etc.)
- ✅ **Professional Email Templates**
- ✅ **Email Configuration Testing**

### 🔧 Developer Experience

- ✅ **Comprehensive Error Handling**
- ✅ **Structured Logging**
- ✅ **Database Migrations** (Drizzle ORM)
- ✅ **TypeScript Support**
- ✅ **API Documentation**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│   Auth Service  │───▶│   PostgreSQL    │
│   (Arcjet)      │    │   (Express)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Rate Limiting   │    │ JWT Tokens      │    │ User Data       │
│ Bot Detection   │    │ OTP Service     │    │ OTP Storage     │
│ Shield Protection│   │ Email Service   │    │ Session Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Components

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Models**: Database schema definitions
- **Middleware**: Security and validation
- **Utils**: Helper functions (JWT, cookies, formatting)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fluxo.io/apps/auth-service

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:migrate

# Start the service
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fluxo_auth"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email Configuration
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM_NAME="Fluxo.io"

# Server
PORT=3001
NODE_ENV="development"
LOG_LEVEL="info"
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "message": "User registered successfully. A verification OTP has been sent to your email.",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified": false
  },
  "requiresEmailVerification": true
}
```

#### Sign In

```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Sign Out

```http
POST /api/v1/auth/signout
```

#### Update Password

```http
POST /api/v1/auth/update-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### OTP Endpoints

#### Generate OTP

```http
POST /api/v1/auth/otp/generate
Content-Type: application/json

{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

#### Verify OTP

```http
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456",
  "purpose": "email_verification"
}
```

#### Resend OTP

```http
POST /api/v1/auth/otp/resend
Content-Type: application/json

{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

### Email Change Endpoints

#### Request Email Change

```http
POST /api/v1/auth/email/change/request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "newEmail": "newemail@example.com"
}
```

#### Verify Email Change

```http
POST /api/v1/auth/email/change/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "otpCode": "123456"
}
```

### Password Reset Endpoints

#### Forgot Password

```http
POST /api/v1/auth/password/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Verify Password Reset OTP

```http
POST /api/v1/auth/password/verify-reset-password-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

#### Reset Password

```http
POST /api/v1/auth/password/reset
Content-Type: application/json

{
  "resetToken": "jwt-reset-token",
  "newPassword": "newPassword123"
}
```

## ⚙️ Configuration

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  auth_provider TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### OTPs Table

```sql
CREATE TABLE otps (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  email TEXT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP
);
```

### Email Configuration

See [EMAIL_CONFIGURATION_GUIDE.md](./EMAIL_CONFIGURATION_GUIDE.md) for detailed email setup instructions.

### OTP Configuration

- **OTP Length**: 6 digits
- **Expiration**: 10 minutes
- **Max Attempts**: 3 per OTP
- **Purposes**: `email_verification`, `password_reset`, `email_change`

## 🔒 Security

### Security Features

1. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum password length validation
   - Password strength requirements

2. **JWT Security**
   - Secure token generation
   - Token expiration (1 day)
   - Secure cookie handling

3. **OTP Security**
   - Time-limited codes (10 minutes)
   - Attempt limiting (3 tries)
   - One-time use only
   - Secure random generation

4. **Input Validation**
   - Zod schema validation
   - Email format validation
   - SQL injection prevention
   - XSS protection

5. **Rate Limiting**
   - API Gateway level (Arcjet)
   - OTP attempt limiting
   - Request throttling

### Security Headers

```javascript
// Applied by security middleware
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production database
- [ ] Set up email service
- [ ] Enable HTTPS
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Run security audit

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/fluxo_auth
JWT_SECRET=your-super-secure-jwt-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-password
LOG_LEVEL=warn
```

## 📖 Additional Documentation

- [OTP Implementation Guide](./OTP_IMPLEMENTATION.md)
- [OTP Usage Examples](./OTP_USAGE_EXAMPLE.md)
- [Email Configuration Guide](./EMAIL_CONFIGURATION_GUIDE.md)
- [Email Verification Flow](./EMAIL_VERIFICATION_FLOW.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Commands

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Run database migrations
pnpm db:migrate

# Generate new migration
pnpm db:generate

# Reset database
pnpm db:reset
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Built with ❤️ by the Fluxo Team**
