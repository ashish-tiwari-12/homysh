const crypto = require('crypto');

exports.generateOTP = () => {
    // Generates a 6-digit numeric OTP securely
    return crypto.randomInt(100000, 999999).toString();
};
