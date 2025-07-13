# Resend Email Setup Guide

## Prerequisites

1. Sign up for a Resend account at [resend.com](https://resend.com)
2. Get your API key from the Resend dashboard
3. Verify your domain or use the sandbox domain for testing

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Other environment variables (add your existing ones here)
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=3000
```

## Getting Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up/login
2. Navigate to the API Keys section in your dashboard
3. Create a new API key
4. Copy the API key and add it to your `.env` file

## Domain Verification

For production use, you should verify your domain:

1. In the Resend dashboard, go to Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update your `FROM_EMAIL` to use your verified domain

For testing, you can use the sandbox domain: `onboarding@resend.dev`

## Usage Examples

### Sending a verification email:
```javascript
const { sendVerificationEmail } = require('./utils/resend');

try {
  await sendVerificationEmail('user@example.com', 'verification-token', 'John Doe');
  console.log('Verification email sent successfully');
} catch (error) {
  console.error('Failed to send verification email:', error);
}
```

### Sending a password reset email:
```javascript
const { sendPasswordResetEmail } = require('./utils/resend');

try {
  await sendPasswordResetEmail('user@example.com', 'reset-token', 'John Doe');
  console.log('Password reset email sent successfully');
} catch (error) {
  console.error('Failed to send password reset email:', error);
}
```

### Sending a custom notification:
```javascript
const { sendNotificationEmail } = require('./utils/resend');

const htmlContent = `
  <h1>Custom Notification</h1>
  <p>This is a custom email notification.</p>
`;

try {
  await sendNotificationEmail('user@example.com', 'Custom Subject', htmlContent);
  console.log('Notification email sent successfully');
} catch (error) {
  console.error('Failed to send notification email:', error);
}
```

### Testing the connection:
```javascript
const { testResendConnection } = require('./utils/resend');

const result = await testResendConnection();
if (result.success) {
  console.log('Resend connection test successful');
} else {
  console.error('Resend connection test failed:', result.error);
}
```

## Available Functions

- `sendVerificationEmail(to, token, username)` - Send email verification
- `sendPasswordResetEmail(to, token, username)` - Send password reset
- `sendNotificationEmail(to, subject, htmlContent, from)` - Send custom notifications
- `sendWelcomeEmail(to, username)` - Send welcome email to new users
- `testResendConnection()` - Test the Resend configuration

## Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and rotate it regularly
- Use environment variables for all sensitive configuration
- Consider rate limiting for email sending endpoints 