const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    voterId: {
        type: String,
        required: [true, 'Voter ID is required'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [5, 'Voter ID must be at least 5 characters'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    boothId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booth',
        required: [true, 'Booth assignment is required'],
    },
    hasVoted: {
        type: Boolean,
        default: false,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
        default: null,
    },
    txHash: {
        type: String,
        default: null,
    },
    walletAddress: {
        type: String,
        default: null,
    },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check and handle account lockout
userSchema.methods.incrementLoginAttempts = async function () {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
        this.isLocked = true;
        this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    }
    await this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.isLocked = false;
    this.lockedUntil = null;
    await this.save();
};

userSchema.index({ voterId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ boothId: 1 });
userSchema.index({ hasVoted: 1 });

module.exports = mongoose.model('User', userSchema);