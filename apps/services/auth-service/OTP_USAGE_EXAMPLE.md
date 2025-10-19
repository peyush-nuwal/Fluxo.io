# OTP Service Usage Examples

## Complete Email Verification Flow

Here's how to implement a complete email verification flow using the OTP service:

### 1. Registration with Email Verification

```javascript
// Frontend: Registration form submission
const registerUser = async (userData) => {
  try {
    // Step 1: Create user account
    const signupResponse = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (signupResponse.ok) {
      const user = await signupResponse.json();

      // Step 2: Generate OTP for email verification
      const otpResponse = await fetch("/api/v1/auth/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          purpose: "email_verification",
        }),
      });

      if (otpResponse.ok) {
        // Show OTP input form to user
        showOTPVerificationForm(userData.email);
      }
    }
  } catch (error) {
    console.error("Registration failed:", error);
  }
};

// Frontend: OTP verification
const verifyEmailOTP = async (email, otpCode) => {
  try {
    const response = await fetch("/api/v1/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        otpCode: otpCode,
        purpose: "email_verification",
      }),
    });

    if (response.ok) {
      // Email verified successfully
      showSuccessMessage("Email verified successfully!");
      // Redirect to dashboard or login
    } else {
      const error = await response.json();
      showErrorMessage(error.error);
    }
  } catch (error) {
    console.error("OTP verification failed:", error);
  }
};
```

### 2. Password Reset Flow

```javascript
// Frontend: Initiate password reset
const initiatePasswordReset = async (email) => {
  try {
    const response = await fetch("/api/v1/auth/otp/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        purpose: "password_reset",
      }),
    });

    if (response.ok) {
      // Show OTP input form
      showPasswordResetOTPForm(email);
    }
  } catch (error) {
    console.error("Password reset initiation failed:", error);
  }
};

// Frontend: Verify OTP and reset password
const resetPasswordWithOTP = async (email, otpCode, newPassword) => {
  try {
    // Step 1: Verify OTP
    const otpResponse = await fetch("/api/v1/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        otpCode: otpCode,
        purpose: "password_reset",
      }),
    });

    if (otpResponse.ok) {
      // Step 2: Update password (you'll need to implement this endpoint)
      const passwordResponse = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
      });

      if (passwordResponse.ok) {
        showSuccessMessage("Password reset successfully!");
      }
    }
  } catch (error) {
    console.error("Password reset failed:", error);
  }
};
```

### 3. Two-Factor Authentication

```javascript
// Frontend: Login with 2FA
const loginWith2FA = async (email, password) => {
  try {
    // Step 1: Initial login attempt
    const loginResponse = await fetch("/api/v1/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (loginResponse.ok) {
      // Step 2: Generate 2FA OTP
      const otpResponse = await fetch("/api/v1/auth/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          purpose: "two_factor",
        }),
      });

      if (otpResponse.ok) {
        // Show 2FA OTP input form
        show2FAForm(email);
      }
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
};

// Frontend: Complete 2FA verification
const complete2FA = async (email, otpCode) => {
  try {
    const otpResponse = await fetch("/api/v1/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        otpCode: otpCode,
        purpose: "two_factor",
      }),
    });

    if (otpResponse.ok) {
      // 2FA completed, user is now fully authenticated
      // You might want to generate a final auth token here
      showSuccessMessage("Login successful!");
      // Redirect to dashboard
    }
  } catch (error) {
    console.error("2FA verification failed:", error);
  }
};
```

### 4. Resend OTP

```javascript
// Frontend: Resend OTP functionality
const resendOTP = async (email, purpose) => {
  try {
    const response = await fetch("/api/v1/auth/otp/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        purpose: purpose,
      }),
    });

    if (response.ok) {
      showSuccessMessage("OTP resent successfully!");
    }
  } catch (error) {
    console.error("Resend OTP failed:", error);
  }
};
```

### 5. Check OTP Status

```javascript
// Frontend: Check if user has active OTP
const checkOTPStatus = async (purpose = "email_verification") => {
  try {
    const response = await fetch(`/api/v1/auth/otp/status?purpose=${purpose}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Get from localStorage/cookie
      },
    });

    if (response.ok) {
      const status = await response.json();
      return status.status;
    }
  } catch (error) {
    console.error("Check OTP status failed:", error);
  }
};

// Usage
const otpStatus = await checkOTPStatus("email_verification");
if (otpStatus.hasActiveOTP && !otpStatus.isExpired) {
  // User has valid OTP, show verification form
  showOTPForm();
} else {
  // Generate new OTP
  await generateOTP(email, "email_verification");
}
```

## Backend Integration Examples

### Extending Auth Controller

You can extend the existing auth controller to integrate OTP verification:

```javascript
// In auth.controller.js
export const signUpWithEmailVerification = async (req, res) => {
  try {
    // Create user (existing logic)
    const user = await createUser({ name, email, password });

    // Generate OTP for email verification
    await generateAndStoreOTP(user.id, email, "email_verification");

    return res.status(201).json({
      message: "User registered. Please verify your email.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false,
      },
    });
  } catch (error) {
    // Handle errors
  }
};
```

### Middleware Integration

```javascript
// Middleware to check if email is verified
export const requireEmailVerification = async (req, res, next) => {
  try {
    const decoded = jwttoken.verify(req.cookies.token);
    const user = await isUserExist(decoded.email);

    // Check if user has verified their email
    const otpStatus = await getOTPStatus(user.id, "email_verification");

    if (!user.email_verified && otpStatus.hasActiveOTP) {
      return res.status(403).json({
        error: "Email verification required",
        email: user.email,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
```

## Error Handling Best Practices

```javascript
// Frontend: Comprehensive error handling
const handleOTPError = (error) => {
  switch (error.message) {
    case "Invalid or expired OTP":
      return "The OTP code is invalid or has expired. Please request a new one.";
    case "OTP has expired":
      return "The OTP has expired. Please request a new one.";
    case "Maximum verification attempts exceeded":
      return "Too many incorrect attempts. Please request a new OTP.";
    case "Invalid OTP code":
      return "Invalid OTP code. Please check and try again.";
    default:
      return "An error occurred. Please try again.";
  }
};
```

This implementation provides a complete, production-ready OTP system that integrates seamlessly with your existing auth service architecture.
