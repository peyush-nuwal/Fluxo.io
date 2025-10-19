# 🛡️ Security Guide

Comprehensive security documentation for the Auth Service, covering security features, best practices, and implementation details.

## 🔒 Security Overview

The Auth Service implements multiple layers of security to protect user data and prevent unauthorized access:

1. **API Gateway Security** (Arcjet)
2. **Authentication & Authorization**
3. **Data Protection**
4. **Input Validation**
5. **Rate Limiting**
6. **Monitoring & Logging**

## 🏗️ Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│ 1. API Gateway (Arcjet)                                     │
│    ├── Rate Limiting (5 req/2s per IP)                     │
│    ├── Bot Detection & Blocking                            │
│    ├── Shield Protection (XSS, SQLi, etc.)                 │
│    └── IP-based Security                                    │
├─────────────────────────────────────────────────────────────┤
│ 2. Auth Service Security                                    │
│    ├── JWT Token Management                                 │
│    ├── Password Hashing (bcrypt)                           │
│    ├── OTP Security (time-limited, attempt-limited)        │
│    ├── Input Validation (Zod schemas)                      │
│    └── Security Headers                                     │
├─────────────────────────────────────────────────────────────┤
│ 3. Database Security                                        │
│    ├── Encrypted Connections (SSL/TLS)                     │
│    ├── Parameterized Queries (SQL injection prevention)    │
│    ├── Access Control                                       │
│    └── Data Encryption at Rest                             │
├─────────────────────────────────────────────────────────────┤
│ 4. Application Security                                     │
│    ├── Error Handling (no sensitive data exposure)         │
│    ├── Logging & Monitoring                                 │
│    ├── Session Management                                   │
│    └── Secure Cookie Handling                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Security

### JWT Token Security

**Token Configuration:**

```javascript
{
  algorithm: "HS256",
  expiresIn: "1d",
  issuer: "fluxo-auth-service",
  audience: "fluxo-app"
}
```

**Security Features:**

- ✅ **Secure Secret**: Strong JWT secret (256-bit)
- ✅ **Short Expiration**: 1-day token lifetime
- ✅ **Secure Cookies**: HttpOnly, Secure, SameSite
- ✅ **Token Validation**: Signature and expiration checks

**Implementation:**

```javascript
// Token generation
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "1d" },
);

// Secure cookie setting
cookies.set(res, "token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});
```

### Password Security

**Hashing Configuration:**

```javascript
{
  algorithm: "bcrypt",
  saltRounds: 10,
  minLength: 6,
  maxLength: 128
}
```

**Security Features:**

- ✅ **bcrypt Hashing**: Industry-standard password hashing
- ✅ **Salt Rounds**: 10 rounds for security/performance balance
- ✅ **Length Validation**: 6-128 character limits
- ✅ **No Plain Text**: Passwords never stored in plain text

**Implementation:**

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🔢 OTP Security

### OTP Generation

**Security Properties:**

```javascript
{
  length: 6,
  type: "numeric",
  algorithm: "cryptographically secure random",
  expiration: "10 minutes",
  maxAttempts: 3,
  oneTimeUse: true
}
```

**Security Features:**

- ✅ **Cryptographically Secure**: Uses `crypto.randomBytes`
- ✅ **Time-Limited**: 10-minute expiration window
- ✅ **Attempt-Limited**: Maximum 3 verification attempts
- ✅ **One-Time Use**: Invalidated after successful use
- ✅ **Purpose-Bound**: Tied to specific verification purpose

**Implementation:**

```javascript
// Secure OTP generation
const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// OTP storage with expiration
const otpData = {
  id: uuidv4(),
  user_id: userId,
  email: email,
  otp_code: otpCode,
  purpose: purpose,
  expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  is_used: false,
  attempts: 0,
};
```

### OTP Verification Security

**Verification Process:**

1. **Input Validation**: Email format, OTP format, purpose
2. **User Verification**: Check user exists
3. **OTP Lookup**: Find active OTP for user/purpose
4. **Expiration Check**: Verify OTP not expired
5. **Attempt Check**: Verify attempts not exceeded
6. **Code Verification**: Compare OTP codes
7. **Mark as Used**: Invalidate OTP after successful use

**Security Measures:**

```javascript
// Attempt limiting
if (otp.attempts >= MAX_ATTEMPTS) {
  throw new Error("Maximum verification attempts exceeded");
}

// Expiration check
if (new Date() > otp.expires_at) {
  throw new Error("OTP has expired");
}

// One-time use
if (otp.is_used) {
  throw new Error("OTP has already been used");
}
```

## 🛡️ Input Validation & Sanitization

### Zod Schema Validation

**Comprehensive Validation:**

```javascript
// User registration validation
export const signUpSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(128),
});

// OTP validation
export const verifyOTPSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  otpCode: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  purpose: z.enum(["email_verification", "password_reset", "email_change"]),
});
```

**Security Features:**

- ✅ **Type Validation**: Strict type checking
- ✅ **Format Validation**: Email, OTP format validation
- ✅ **Length Limits**: Min/max length constraints
- ✅ **Enum Validation**: Restricted value sets
- ✅ **Sanitization**: Trim whitespace, normalize case

### SQL Injection Prevention

**Parameterized Queries:**

```javascript
// Safe database queries using Drizzle ORM
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

// No string concatenation or template literals in queries
// All user input is properly parameterized
```

## 🚦 Rate Limiting

### API Gateway Level (Arcjet)

**Rate Limiting Configuration:**

```javascript
{
  slidingWindow: {
    interval: 2, // seconds
    max: 5, // requests per window
    mode: "LIVE" // or "DRY_RUN"
  }
}
```

**Protection Features:**

- ✅ **IP-based Limiting**: 5 requests per 2 seconds per IP
- ✅ **Bot Detection**: Blocks malicious bots
- ✅ **Shield Protection**: Prevents common attacks
- ✅ **Automatic Blocking**: Blocks suspicious IPs

### Service Level Rate Limiting

**OTP Rate Limiting:**

```javascript
// OTP attempt limiting
const MAX_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 10;

// Email sending rate limiting
const EMAIL_RATE_LIMIT = {
  maxEmailsPerHour: 10,
  maxEmailsPerDay: 50,
};
```

## 🔍 Security Headers

**Implemented Security Headers:**

```javascript
// Security middleware
res.setHeader("X-Content-Type-Options", "nosniff");
res.setHeader("X-Frame-Options", "DENY");
res.setHeader("X-XSS-Protection", "1; mode=block");
res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
res.setHeader("Content-Security-Policy", "default-src 'self'");
```

**Header Protection:**

- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-XSS-Protection**: Enables XSS filtering
- ✅ **Referrer-Policy**: Controls referrer information
- ✅ **CSP**: Content Security Policy

## 📊 Monitoring & Logging

### Security Event Logging

**Logged Security Events:**

```javascript
// Authentication events
logger.info("User registered successfully", { userId, email });
logger.info("User signed in successfully", { userId, email });
logger.warn("Failed login attempt", { email, ip, userAgent });
logger.error("Invalid token attempt", { ip, userAgent });

// OTP events
logger.info("OTP generated", { userId, email, purpose });
logger.info("OTP verified successfully", { userId, email, purpose });
logger.warn("OTP verification failed", { userId, email, reason });
logger.warn("OTP attempts exceeded", { userId, email });

// Security events
logger.warn("Potential path traversal attempt", { ip, path });
logger.warn("Rate limit exceeded", { ip, userAgent });
logger.error("Security middleware error", { error, ip });
```

### Security Monitoring

**Key Metrics to Monitor:**

- Failed login attempts per IP
- OTP verification failure rates
- Rate limit violations
- Unusual authentication patterns
- Email delivery failures
- Database connection issues

## 🔐 Data Protection

### Sensitive Data Handling

**Data Classification:**

```javascript
// Highly Sensitive (encrypted)
- Passwords (bcrypt hashed)
- JWT secrets
- Database credentials

// Sensitive (protected)
- Email addresses
- User IDs
- OTP codes

// Public (safe to log)
- User names
- Timestamps
- Error messages (sanitized)
```

**Protection Measures:**

- ✅ **Password Hashing**: bcrypt with salt
- ✅ **Token Security**: Secure JWT secrets
- ✅ **Database Encryption**: SSL/TLS connections
- ✅ **Log Sanitization**: No sensitive data in logs
- ✅ **Error Handling**: No sensitive data in error messages

### Database Security

**Database Protection:**

```javascript
// Connection security
const dbConfig = {
  ssl: process.env.NODE_ENV === "production",
  connectionString: process.env.DATABASE_URL
};

// Query security
- Parameterized queries only
- No dynamic SQL construction
- Input validation before queries
- Connection pooling with limits
```

## 🚨 Incident Response

### Security Incident Types

1. **Brute Force Attacks**
   - Monitor failed login attempts
   - Implement account lockout
   - Block suspicious IPs

2. **OTP Abuse**
   - Monitor OTP generation rates
   - Implement cooldown periods
   - Rate limit email sending

3. **Token Compromise**
   - Monitor token usage patterns
   - Implement token revocation
   - Force re-authentication

### Response Procedures

**Immediate Response:**

1. Identify the security incident
2. Assess the scope and impact
3. Implement immediate mitigation
4. Log all relevant information

**Follow-up Actions:**

1. Investigate root cause
2. Implement permanent fixes
3. Update security measures
4. Document lessons learned

## 🔧 Security Configuration

### Environment Variables

**Required Security Variables:**

```env
# JWT Security
JWT_SECRET=your-super-secure-256-bit-secret

# Database Security
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require

# Email Security
EMAIL_USER=your-secure-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Application Security
NODE_ENV=production
LOG_LEVEL=warn
```

### Production Security Checklist

- [ ] Strong JWT secret (256-bit)
- [ ] Database SSL enabled
- [ ] Email app passwords (not regular passwords)
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Monitoring enabled
- [ ] Logging configured
- [ ] Error handling secure
- [ ] Dependencies updated

## 📚 Security Best Practices

### Development

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Validate all inputs** with schemas
4. **Handle errors securely** (no sensitive data)
5. **Use parameterized queries** only
6. **Implement proper logging** for security events

### Deployment

1. **Use HTTPS** in production
2. **Enable database SSL** connections
3. **Configure security headers**
4. **Set up monitoring** and alerting
5. **Regular security updates**
6. **Backup and recovery** procedures

### Operations

1. **Monitor security metrics** regularly
2. **Review logs** for suspicious activity
3. **Update dependencies** promptly
4. **Conduct security audits** periodically
5. **Train team** on security practices
6. **Have incident response** plan ready

## 🔍 Security Testing

### Automated Testing

**Security Test Types:**

- Input validation tests
- Authentication tests
- Authorization tests
- Rate limiting tests
- Error handling tests

**Example Security Test:**

```javascript
describe("Security Tests", () => {
  test("should reject SQL injection attempts", async () => {
    const response = await request(app).post("/api/v1/auth/signin").send({
      email: "'; DROP TABLE users; --",
      password: "password",
    });

    expect(response.status).toBe(400);
  });
});
```

### Manual Testing

**Security Test Checklist:**

- [ ] Test input validation
- [ ] Test authentication bypass
- [ ] Test rate limiting
- [ ] Test error handling
- [ ] Test token security
- [ ] Test OTP security
- [ ] Test password security

---

This security guide provides comprehensive coverage of all security aspects in the Auth Service. Regular review and updates of security measures are essential for maintaining a secure authentication system.
