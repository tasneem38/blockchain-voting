const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('ready', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

/**
 * SET OTP with expiry
 */
const setOTP = async (voterId, otp, ttlSeconds = 300) => {
    await redis.set(`otp:${voterId}`, otp, 'EX', ttlSeconds);
};

/**
 * GET OTP
 */
const getOTP = async (voterId) => {
    return await redis.get(`otp:${voterId}`);
};

/**
 * DELETE OTP
 */
const deleteOTP = async (voterId) => {
    await redis.del(`otp:${voterId}`);
};

/**
 * Increment and track OTP verification attempts
 */
const incrementOTPAttempts = async (voterId) => {
    const key = `otp_attempts:${voterId}`;
    const attempts = await redis.incr(key);
    if (attempts === 1) {
        await redis.expire(key, 300); // 5 min expiry for attempts tracker
    }
    return attempts;
};

const getOTPAttempts = async (voterId) => {
    return parseInt(await redis.get(`otp_attempts:${voterId}`)) || 0;
};

/**
 * Blacklist token (JTI) on logout
 */
const blacklistToken = async (jti, ttlSeconds) => {
    await redis.set(`blacklist:${jti}`, '1', 'EX', ttlSeconds);
};

const isTokenBlacklisted = async (jti) => {
    const exists = await redis.exists(`blacklist:${jti}`);
    return exists === 1;
};

module.exports = {
    redis,
    setOTP,
    getOTP,
    deleteOTP,
    incrementOTPAttempts,
    getOTPAttempts,
    blacklistToken,
    isTokenBlacklisted
};
