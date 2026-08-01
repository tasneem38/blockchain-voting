const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            console.error(`MongoDB error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Retrying...');
        });

    } catch (err) {
        console.error(`Connection failed: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;