require('dotenv').config();
const { testResendConnection, sendVerificationEmail } = require('./utils/resend');

async function testResend() {
    console.log('Testing Resend connection...');
    
    // Test basic connection
    const result = await testResendConnection();
    if (result.success) {
        console.log('✅ Resend connection test successful');
    } else {
        console.error('❌ Resend connection test failed:', result.error);
        return;
    }

    // Test sending a verification email (replace with your test email)
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testToken = 'test-verification-token-123';
    const testUsername = 'Test User';

    console.log(`\nTesting verification email to: ${testEmail}`);
    
    try {
        await sendVerificationEmail(testEmail, testToken, testUsername);
        console.log('✅ Verification email sent successfully');
    } catch (error) {
        console.error('❌ Failed to send verification email:', error.message);
    }
}

// Run the test
testResend().catch(console.error); 