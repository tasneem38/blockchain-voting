const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Roles that should never receive emails — OTP goes to terminal only
const TERMINAL_ONLY_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'BOOTH_ADMIN']);

// Fake/test domains that should not be emailed
const FAKE_DOMAINS = new Set(['test.com', 'demo.com', 'example.com', 'fake.com', 'local.com']);

/**
 * Sends OTP email to voter (or prints to terminal for admin/booth roles & test accounts)
 * @param {string} toEmail 
 * @param {string} voterId 
 * @param {string} otp 
 * @param {string} [role='VOTER']  - role of the user (ADMIN, BOOTH_ADMIN, SUPER_ADMIN, VOTER)
 */
const sendOTPEmail = async (toEmail, voterId, otp, role = 'VOTER') => {
    const domain = (toEmail || '').split('@')[1]?.toLowerCase();
    const isTerminalOnly = TERMINAL_ONLY_ROLES.has(role) || FAKE_DOMAINS.has(domain);

    // Always log to terminal
    console.log('\n' + '='.repeat(50));
    if (TERMINAL_ONLY_ROLES.has(role)) {
        console.log(`🔐 [${role} OTP] ID: ${voterId}  →  OTP: ${otp}`);
    } else {
        console.log(`🔑 [OTP] Voter: ${voterId}  →  OTP: ${otp}`);
    }
    console.log('='.repeat(50) + '\n');

    if (isTerminalOnly) {
        // Do not attempt email delivery for admin roles or test domains
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Your Voting OTP - Booth Voting System',
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                <h2 style="color: #2563eb; text-align: center;">Secure Voting System</h2>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p>Dear Voter <strong>${voterId}</strong>,</p>
                <p>Your One-Time Password (OTP) for voting authentication is:</p>
                <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #64748b;">This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
                <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 12px; margin-top: 24px;">
                    <p style="font-size: 12px; color: #9a3412; margin: 0;">If you did not request this, contact election officials immediately.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        // Log the error but don't crash — OTP was already printed to terminal
        console.error('Email send failure (OTP already shown in terminal):', err.message);
    }
};

module.exports = sendOTPEmail;

