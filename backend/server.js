require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { redis } = require('./config/redis');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const voteRoutes = require('./routes/voteRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const resultRoutes = require('./routes/resultRoutes');

// Import Admin Routes
const adminVoterRoutes = require('./routes/admin/voterRoutes');
const adminCandidateRoutes = require('./routes/admin/candidateRoutes');
const adminBoothRoutes = require('./routes/admin/boothRoutes');
const adminElectionRoutes = require('./routes/admin/electionRoutes');
const adminAuditRoutes = require('./routes/admin/auditRoutes');
const adminOverviewRoutes = require('./routes/admin/overviewRoutes');

// Connect to Database
connectDB();

const app = express();
const httpServer = http.createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Make io accessible to controllers
module.exports.io = io;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Apply global rate limiter to API routes
app.use('/api', apiLimiter);

// Mount Public/Voter Routes
app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/results', resultRoutes);

// Mount Admin Routes
app.use('/api/admin/voters', adminVoterRoutes);
app.use('/api/admin/candidates', adminCandidateRoutes);
app.use('/api/admin/booths', adminBoothRoutes);
app.use('/api/admin/election', adminElectionRoutes);
app.use('/api/admin/audit', adminAuditRoutes);
app.use('/api/admin/overview', adminOverviewRoutes);

// Protect results endpoint for admin
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
app.use('/api/admin/results', authMiddleware, adminMiddleware, resultRoutes);

// Socket.io Connection Handler
io.on('connection', (socket) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Client connected:', socket.id);
    }
    
    socket.on('disconnect', () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('Client disconnected:', socket.id);
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: redis.status === 'ready' ? 'connected' : 'disconnected'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});