# Email Verification Flow Implementation

## Overview

This document describes the complete email verification flow integrated into the signup and signin process.

## Backend API Endpoints

### 1. Signup with Email Verification
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please verify your email to continue.",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified": false
  },
  "requiresEmailVerification": true
}
```

### 2. Verify Email with OTP
```
POST /api/v1/auth/otp/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456",
  "purpose": "email_verification"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully",
  "emailVerified": true
}
```

### 3. Signin (After Email Verification)
```
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Sign in success",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified": true
  }
}
```

### 4. Signin (Before Email Verification)
```
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (403):**
```json
{
  "error": "Email not verified",
  "message": "Please verify your email before signing in",
  "email": "john@example.com",
  "requiresEmailVerification": true
}
```

### 5. Resend Verification Email
```
POST /api/v1/auth/otp/resend
Content-Type: application/json

{
  "email": "john@example.com",
  "purpose": "email_verification"
}
```

## Frontend Implementation Flow

### Step 1: Signup Form
```javascript
const signupUser = async (userData) => {
  try {
    const response = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (result.requiresEmailVerification) {
      // Show email verification form
      showEmailVerificationForm(result.user.email);
    }
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

### Step 2: Email Verification Form
```javascript
const EmailVerificationForm = ({ email }) => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyEmail = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otpCode: otpCode,
          purpose: 'email_verification'
        })
      });

      if (response.ok) {
        // Email verified successfully
        showSuccessMessage('Email verified! You can now sign in.');
        // Redirect to signin page
        navigate('/signin');
      } else {
        const error = await response.json();
        showErrorMessage(error.error);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    try {
      await fetch('/api/v1/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          purpose: 'email_verification'
        })
      });
      showSuccessMessage('Verification email resent!');
    } catch (error) {
      console.error('Resend failed:', error);
    }
  };

  return (
    <div>
      <h2>Verify Your Email</h2>
      <p>We've sent a 6-digit code to {email}</p>
      <input
        type="text"
        value={otpCode}
        onChange={(e) => setOtpCode(e.target.value)}
        placeholder="Enter 6-digit code"
        maxLength="6"
      />
      <button onClick={verifyEmail} disabled={isVerifying}>
        {isVerifying ? 'Verifying...' : 'Verify Email'}
      </button>
      <button onClick={resendOTP}>Resend Code</button>
    </div>
  );
};
```

### Step 3: Signin with Email Verification Check
```javascript
const signinUser = async (credentials) => {
  try {
    const response = await fetch('/api/v1/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const result = await response.json();

    if (result.requiresEmailVerification) {
      // Show email verification form
      showEmailVerificationForm(result.email);
      return;
    }

    if (response.ok) {
      // User signed in successfully
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Signin failed:', error);
  }
};
```

### Step 4: Complete React Component Example
```javascript
import React, { useState } from 'react';

const AuthFlow = () => {
  const [step, setStep] = useState('signup'); // 'signup', 'verify', 'signin'
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (userData) => {
    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (result.requiresEmailVerification) {
        setUserEmail(result.user.email);
        setStep('verify');
        setMessage('Please check your email for the verification code.');
      }
    } catch (error) {
      setMessage('Signup failed. Please try again.');
    }
  };

  const handleEmailVerification = async (otpCode) => {
    try {
      const response = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          otpCode: otpCode,
          purpose: 'email_verification'
        })
      });

      if (response.ok) {
        setMessage('Email verified successfully! You can now sign in.');
        setStep('signin');
      } else {
        const error = await response.json();
        setMessage(error.error);
      }
    } catch (error) {
      setMessage('Verification failed. Please try again.');
    }
  };

  const handleSignin = async (credentials) => {
    try {
      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (result.requiresEmailVerification) {
        setUserEmail(result.email);
        setStep('verify');
        setMessage('Please verify your email before signing in.');
        return;
      }

      if (response.ok) {
        setMessage('Sign in successful!');
        // Redirect to dashboard
      }
    } catch (error) {
      setMessage('Sign in failed. Please try again.');
    }
  };

  return (
    <div>
      {message && <div className="message">{message}</div>}
      
      {step === 'signup' && <SignupForm onSubmit={handleSignup} />}
      {step === 'verify' && <EmailVerificationForm onSubmit={handleEmailVerification} email={userEmail} />}
      {step === 'signin' && <SigninForm onSubmit={handleSignin} />}
    </div>
  );
};
```

## Database Schema Changes

### Users Table
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;
```

## Security Features

1. **Email Verification Required**: Users cannot sign in until email is verified
2. **OTP Expiration**: OTPs expire after 10 minutes
3. **Rate Limiting**: Maximum 3 verification attempts per OTP
4. **One-time Use**: Each OTP can only be used once
5. **Secure Storage**: OTPs are stored securely in the database

## Error Handling

### Common Error Responses:
- `400`: Invalid OTP code
- `403`: Email not verified
- `404`: User not found
- `429`: Maximum verification attempts exceeded
- `500`: Internal server error

## Testing the Flow

1. **Signup**: Create a new user account
2. **Check Email**: Verify email with OTP code
3. **Signin**: Sign in with verified email
4. **Test Unverified Signin**: Try to sign in before email verification

## Migration

Run the database migration:
```bash
cd apps/auth-service
pnpm db:migrate
```

This will add the `email_verified` column to the users table.
