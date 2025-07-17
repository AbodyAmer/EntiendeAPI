const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email (you can change this to your verified domain)
const DEFAULT_FROM_EMAIL = process.env.FROM_EMAIL;

/**
 * Send a verification email to a user
 * @param {string} to - Recipient email address
 * @param {string} token - Verification token
 * @param {string} username - User's name
 * @returns {Promise<Object>} - Resend response
 */
async function sendVerificationEmail(to, code, username) {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to Efham!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for signing up! Please verify your email address using the 6-digit code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; display: inline-block;">
              <h1 style="color: #007bff; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
          </div>
          <p style="text-align: center; color: #666; font-size: 14px;">Enter this code in the verification page to complete your registration.</p>
          <p>This code will expire in 60 minutes.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from Efham. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} token - Password reset token
 * @param {string} username - User's name
 * @returns {Promise<Object>} - Resend response
 */
async function sendPasswordResetEmail(to, token, username) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from Efham. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

/**
 * Send a general notification email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} from - Sender email (optional, uses default if not provided)
 * @returns {Promise<Object>} - Resend response
 */
async function sendNotificationEmail(to, subject, htmlContent, from = DEFAULT_FROM_EMAIL) {
  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      html: htmlContent
    });

    if (error) {
      console.error('Error sending notification email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
}

/**
 * Send a welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} username - User's name
 * @returns {Promise<Object>} - Resend response
 */
async function sendWelcomeEmail(to, username) {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject: 'Welcome to Efham!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Welcome to Efham!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for joining Efham! We're excited to have you as part of our community.</p>
          <p>Here's what you can do to get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore our content</li>
            <li>Connect with other users</li>
            <li>Start learning and growing</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p>If you have any questions or need help, don't hesitate to reach out to our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from Efham. If you have any questions, please contact our support team.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

/**
 * Test the Resend configuration
 * @returns {Promise<Object>} - Test result
 */
async function testResendConnection() {
  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ['test@example.com'],
      subject: 'Test Email',
      html: '<p>This is a test email to verify Resend configuration.</p>'
    });

    if (error) {
      console.error('Resend test failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Resend test failed:', error);
    return { success: false, error };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
  testResendConnection
};
