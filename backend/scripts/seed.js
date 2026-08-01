require('dotenv').config();
const mongoose = require('mongoose');
const Booth = require('../models/Booth');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await Promise.all([
            Booth.deleteMany({}),
            User.deleteMany({}),
            Candidate.deleteMany({}),
            Admin.deleteMany({}),
            AuditLog.deleteMany({}),
        ]);
        console.log('Cleared existing collections.');

        // ── 1. BOOTHS ──────────────────────────────────────────────
        const booths = await Booth.insertMany([
            { boothId: 'BOOTH-KA-01', location: 'Govt High School, Jayanagar, Bengaluru' },
            { boothId: 'BOOTH-KA-02', location: 'Town Hall, MG Road, Bengaluru' },
            { boothId: 'BOOTH-KA-03', location: 'Community Center, Whitefield, Bengaluru' },
        ]);
        console.log(`Seeded ${booths.length} booths.`);

        const [booth1, booth2, booth3] = booths;

        // ── 2. CANDIDATES ──────────────────────────────────────────
        const candidates = await Candidate.insertMany([
            { candidateId: 'CAND-001', name: 'Arjun Sharma', party: 'National Progress Party', boothId: booth1._id },
            { candidateId: 'CAND-002', name: 'Priya Nair', party: 'Democratic Alliance', boothId: booth1._id },
            { candidateId: 'CAND-003', name: 'Ravi Kumar', party: 'People\'s Front', boothId: booth2._id },
            { candidateId: 'CAND-004', name: 'Sunita Reddy', party: 'United Republic Party', boothId: booth2._id },
            { candidateId: 'CAND-005', name: 'Mohan Das', party: 'National Progress Party', boothId: booth3._id },
            { candidateId: 'CAND-006', name: 'Lakshmi Iyer', party: 'Democratic Alliance', boothId: booth3._id },
        ]);
        console.log(`Seeded ${candidates.length} candidates.`);

        // ── 3. VOTERS ──────────────────────────────────────────────
        // Note: passwords are hashed automatically by the User model pre-save hook
        const voters = await User.create([
            { voterId: 'VOTER-001', password: 'Test@1234', email: 'voter1@test.com', boothId: booth1._id },
            { voterId: 'VOTER-002', password: 'Test@1234', email: 'voter2@test.com', boothId: booth1._id },
            { voterId: 'VOTER-003', password: 'Test@1234', email: 'voter3@test.com', boothId: booth2._id },
            { voterId: 'VOTER-004', password: 'Test@1234', email: 'voter4@test.com', boothId: booth2._id },
            { voterId: 'VOTER-005', password: 'Test@1234', email: 'voter5@test.com', boothId: booth3._id },
        ]);
        console.log(`Seeded ${voters.length} voters.`);

        // Update voterCount on each booth
        await Booth.findByIdAndUpdate(booth1._id, { voterCount: 2 });
        await Booth.findByIdAndUpdate(booth2._id, { voterCount: 2 });
        await Booth.findByIdAndUpdate(booth3._id, { voterCount: 1 });

        // ── 4. ADMIN ───────────────────────────────────────────────
        const admin = await Admin.create({
            adminId: 'ADMIN-001',
            password: 'Admin@1234',
            email: 'admin@votingsystem.com',
            role: 'SUPER_ADMIN',
        });
        console.log(`Seeded admin: ${admin.adminId}`);

        // ── 5. SAMPLE AUDIT LOG ────────────────────────────────────
        await AuditLog.create({
            action: 'ADMIN_LOGIN',
            actorId: 'ADMIN-001',
            actorRole: 'ADMIN',
            success: true,
            metadata: { note: 'Initial system seed' },
        });
        console.log('Seeded sample audit log entry.');

        console.log('\n✅ DATABASE SEEDED SUCCESSFULLY');
        console.log('─────────────────────────────────────');
        console.log('Test Voter Login:');
        console.log('  Voter ID : VOTER-001');
        console.log('  Password : Test@1234');
        console.log('  Email    : voter1@test.com');
        console.log('  Booth    : BOOTH-KA-01');
        console.log('\nAdmin Login:');
        console.log('  Admin ID : ADMIN-001');
        console.log('  Password : Admin@1234');
        console.log('─────────────────────────────────────\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('Seed failed:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();