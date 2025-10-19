# Email Configuration Guide for OTP Service

## No-Reply Email Setup

You can send emails from a "no-reply" address without creating a new email account. Here are your options:

### Option 1: Use Your Domain (Recommended)

```env
# Your actual Gmail credentials for authentication
EMAIL_USER=gokunuwal@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail

# Use no-reply with your domain
EMAIL_FROM=no-reply@fluxo.io
EMAIL_DOMAIN=fluxo.io
```

### Option 2: Use Gmail's Domain

```env
# Your actual Gmail credentials for authentication
EMAIL_USER=gokunuwal@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail

# Use no-reply with Gmail domain
EMAIL_FROM=no-reply@gmail.com
EMAIL_DOMAIN=gmail.com
```

### Option 3: Use a Custom Business Email

```env
# Your actual Gmail credentials for authentication
EMAIL_USER=gokunuwal@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail

# Use your business email
EMAIL_FROM=no-reply@yourbusiness.com
EMAIL_DOMAIN=yourbusiness.com
```

### Option 4: Use Your Gmail with Alias

```env
# Your actual Gmail credentials for authentication
EMAIL_USER=gokunuwal@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail

# Use an alias that looks professional
EMAIL_FROM=noreply.fluxo@gmail.com
EMAIL_DOMAIN=gmail.com
```

## How It Works

- **Authentication**: You still authenticate with your real Gmail account (`EMAIL_USER` and `EMAIL_PASSWORD`)
- **From Address**: The email appears to come from the `EMAIL_FROM` address
- **Recipients**: Will see the professional "no-reply" address instead of your personal email

## Example Email Headers

When using the configuration, recipients will see:

```
From: no-reply@fluxo.io
To: user@example.com
Subject: Email Verification Code
```

Instead of:

```
From: gokunuwal@gmail.com
To: user@example.com
Subject: Email Verification Code
```

## Recommended Configuration for Production

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=your-app-password

# Professional no-reply address
EMAIL_FROM=no-reply@fluxo.io
EMAIL_DOMAIN=fluxo.io
```

## Testing

1. **Test email configuration:**

   ```
   GET http://localhost:4001/api/v1/auth/otp/test-email
   ```

2. **Test OTP generation:**

   ```
   POST http://localhost:4001/api/v1/auth/otp/generate
   Content-Type: application/json

   {
     "email": "test@example.com",
     "purpose": "email_verification"
   }
   ```

## Important Notes

1. **Gmail App Password**: You still need to use your Gmail app password for authentication
2. **Domain Verification**: Some email providers may require domain verification for custom domains
3. **Spam Filters**: Using your domain (like `no-reply@fluxo.io`) is better for spam filtering
4. **Professional Appearance**: No-reply addresses look more professional than personal emails

## Troubleshooting

If you get authentication errors:

- Make sure you're using an App Password, not your regular Gmail password
- Verify that 2-factor authentication is enabled on your Gmail account
- Check that the `EMAIL_FROM` address doesn't conflict with your authentication email

The system will automatically fall back to `no-reply@yourdomain.com` if `EMAIL_FROM` is not set.
