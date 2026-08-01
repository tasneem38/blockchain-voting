const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends OTP email to voter
 * @param {string} toEmail 
 * @param {string} voterId 
 * @param {string} otp 
 */
const sendOTPEmail = async (toEmail, voterId, otp) => {
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
        console.log(`\n🔑 [TESTING] OTP for ${voterId}: ${otp}\n`);
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Email send failure:', err.message);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = sendOTPEmail;
