const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendMail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"homysh" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// ----------------- HTML TEMPLATES -----------------

exports.getWelcomeEmailTemplate = (name) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ef4444;">Welcome to homysh 🎉</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for registering! We're thrilled to have you on board. Start exploring unique properties and experiences around the world today.</p>
            <br>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best Regards,<br><strong>The homysh Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">Support Email: support@homysh.com</p>
        </div>
    `;
};

exports.getOtpEmailTemplate = (otp) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ef4444;">Password Reset Request</h2>
            <p>We received a request to reset your homysh password.</p>
            <p>Your OTP code is:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; padding: 15px 30px; background-color: #f5f5f5; border-radius: 8px;">
                    ${otp}
                </span>
            </div>
            <p style="color: #ef4444; font-weight: bold;">This code will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email. Your account is safe.</p>
            <p>Best Regards,<br><strong>The homysh Team</strong></p>
        </div>
    `;
};

exports.getResetSuccessEmailTemplate = () => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #22c55e;">Password Reset Successful ✅</h2>
            <p>Your password has been successfully reset. You can now use your new password to log in.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
            <p>Best Regards,<br><strong>The homysh Team</strong></p>
        </div>
    `;
};
