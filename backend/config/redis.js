const Redis = require('ioredis');

let redis = null;
let useMemoryFallback = false;
const inMemoryStore = new Map();

try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
            if (times > 2) {
                if (!useMemoryFallback) {
                    useMemoryFallback = true;
                    console.warn('⚠️ Redis server not available locally. Falling back to In-Memory store for OTP & Token sessions.');
                }
                return null; // Stop reconnecting
            }
            return Math.min(times * 100, 2000);
        },
        lazyConnect: false
    });

    redis.on('ready', () => {
        useMemoryFallback = false;
        console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
        if (!useMemoryFallback) {
            // Silence repetitive log errors
            console.warn('⚠️ Redis connection failed. Switching to in-memory fallback mode.');
            useMemoryFallback = true;
        }
    });
} catch (e) {
    useMemoryFallback = true;
    console.warn('⚠️ Redis initialized in fallback memory mode.');
}

/**
 * SET OTP with expiry
 */
const setOTP = async (voterId, otp, ttlSeconds = 300) => {
    if (useMemoryFallback || !redis) {
        inMemoryStore.set(`otp:${voterId}`, { value: otp, expiresAt: Date.now() + ttlSeconds * 1000 });
        return;
    }
    try {
        await redis.set(`otp:${voterId}`, otp, 'EX', ttlSeconds);
    } catch (e) {
        inMemoryStore.set(`otp:${voterId}`, { value: otp, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
};

/**
 * GET OTP
 */
const getOTP = async (voterId) => {
    if (useMemoryFallback || !redis) {
        const item = inMemoryStore.get(`otp:${voterId}`);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            inMemoryStore.delete(`otp:${voterId}`);
            return null;
        }
        return item.value;
    }
    try {
        return await redis.get(`otp:${voterId}`);
    } catch (e) {
        const item = inMemoryStore.get(`otp:${voterId}`);
        return item ? item.value : null;
    }
};

/**
 * DELETE OTP
 */
const deleteOTP = async (voterId) => {
    if (useMemoryFallback || !redis) {
        inMemoryStore.delete(`otp:${voterId}`);
        return;
    }
    try {
        await redis.del(`otp:${voterId}`);
    } catch (e) {
        inMemoryStore.delete(`otp:${voterId}`);
    }
};

/**
 * Increment and track OTP verification attempts
 */
const incrementOTPAttempts = async (voterId) => {
    const key = `otp_attempts:${voterId}`;
    if (useMemoryFallback || !redis) {
        const item = inMemoryStore.get(key) || { count: 0, expiresAt: Date.now() + 300000 };
        item.count += 1;
        inMemoryStore.set(key, item);
        return item.count;
    }
    try {
        const attempts = await redis.incr(key);
        if (attempts === 1) {
            await redis.expire(key, 300);
        }
        return attempts;
    } catch (e) {
        return 1;
    }
};

const getOTPAttempts = async (voterId) => {
    const key = `otp_attempts:${voterId}`;
    if (useMemoryFallback || !redis) {
        const item = inMemoryStore.get(key);
        return item ? item.count : 0;
    }
    try {
        return parseInt(await redis.get(key)) || 0;
    } catch (e) {
        return 0;
    }
};

/**
 * Blacklist token (JTI) on logout
 */
const blacklistToken = async (jti, ttlSeconds) => {
    const key = `blacklist:${jti}`;
    if (useMemoryFallback || !redis) {
        inMemoryStore.set(key, { value: '1', expiresAt: Date.now() + ttlSeconds * 1000 });
        return;
    }
    try {
        await redis.set(key, '1', 'EX', ttlSeconds);
    } catch (e) {
        inMemoryStore.set(key, { value: '1', expiresAt: Date.now() + ttlSeconds * 1000 });
    }
};

const isTokenBlacklisted = async (jti) => {
    const key = `blacklist:${jti}`;
    if (useMemoryFallback || !redis) {
        const item = inMemoryStore.get(key);
        if (!item) return false;
        if (Date.now() > item.expiresAt) {
            inMemoryStore.delete(key);
            return false;
        }
        return true;
    }
    try {
        const exists = await redis.exists(key);
        return exists === 1;
    } catch (e) {
        return false;
    }
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
