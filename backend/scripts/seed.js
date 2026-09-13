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

        // ── 1. KARNATAKA BOOTHS (Bengaluru Urban) ──────────────────
        const booths = await Booth.insertMany([
            {
                boothId: 'BOOTH-KA-01',
                location: 'St. John Auditorium, Koramangala',
                state: 'Karnataka',
                district: 'Bengaluru Urban',
                constituency: 'BTM Layout (AC-172)',
                wardNumber: 'Ward 172',
            },
            {
                boothId: 'BOOTH-KA-02',
                location: 'Govt Primary School, Madiwala',
                state: 'Karnataka',
                district: 'Bengaluru Urban',
                constituency: 'BTM Layout (AC-172)',
                wardNumber: 'Ward 172',
            },
            {
                boothId: 'BOOTH-KA-03',
                location: 'National College, Jayanagar 7th Block',
                state: 'Karnataka',
                district: 'Bengaluru Urban',
                constituency: 'Jayanagar (AC-173)',
                wardNumber: 'Ward 173',
            },
            {
                boothId: 'BOOTH-KA-04',
                location: 'HAL Public School, Indiranagar',
                state: 'Karnataka',
                district: 'Bengaluru Urban',
                constituency: 'C.V. Raman Nagar (AC-174)',
                wardNumber: 'Ward 174',
            },
        ]);
        console.log(`Seeded ${booths.length} Karnataka polling booths.`);

        const [booth1, booth2, booth3, booth4] = booths;

        // ── 2. CANDIDATES (Karnataka State Assembly) ───────────────
        const candidates = await Candidate.insertMany([
            // BTM Layout Candidates (Booth 1 & 2)
            {
                candidateId: 'CAND-KA-01',
                name: 'Ramalinga Reddy',
                party: 'Indian National Congress (INC)',
                constituency: 'BTM Layout (AC-172)',
                electionType: 'Karnataka State Assembly',
                boothId: booth1._id
            },
            {
                candidateId: 'CAND-KA-02',
                name: 'Sridhara Reddy',
                party: 'Bharatiya Janata Party (BJP)',
                constituency: 'BTM Layout (AC-172)',
                electionType: 'Karnataka State Assembly',
                boothId: booth1._id
            },
            {
                candidateId: 'CAND-KA-03',
                name: 'K. V. Gowda',
                party: 'Janata Dal (Secular)',
                constituency: 'BTM Layout (AC-172)',
                electionType: 'Karnataka State Assembly',
                boothId: booth1._id
            },

            // Jayanagar Candidates (Booth 3)
            {
                candidateId: 'CAND-KA-04',
                name: 'C. K. Ramamurthy',
                party: 'Bharatiya Janata Party (BJP)',
                constituency: 'Jayanagar (AC-173)',
                electionType: 'Karnataka State Assembly',
                boothId: booth3._id
            },
            {
                candidateId: 'CAND-KA-05',
                name: 'Sowmya Reddy',
                party: 'Indian National Congress (INC)',
                constituency: 'Jayanagar (AC-173)',
                electionType: 'Karnataka State Assembly',
                boothId: booth3._id
            },

            // C.V. Raman Nagar Candidates (Booth 4)
            {
                candidateId: 'CAND-KA-06',
                name: 'S. Raghu',
                party: 'Bharatiya Janata Party (BJP)',
                constituency: 'C.V. Raman Nagar (AC-174)',
                electionType: 'Karnataka State Assembly',
                boothId: booth4._id
            },
            {
                candidateId: 'CAND-KA-07',
                name: 'Anand Kumar',
                party: 'Indian National Congress (INC)',
                constituency: 'C.V. Raman Nagar (AC-174)',
                electionType: 'Karnataka State Assembly',
                boothId: booth4._id
            },
        ]);
        console.log(`Seeded ${candidates.length} Karnataka Assembly candidates.`);

        // ── 3. REGISTERED VOTERS (EXACTLY 10 VOTERS) ──────────────
        const voters = await User.create([
            // Booth 1: St. John Auditorium (BTM Layout)
            {
                voterId: 'VOTER-001',
                password: 'Test@1234',
                email: 'voter1@test.com',
                fullName: 'Ramesh Kumar',
                epicNumber: 'KA/01/172/100001',
                aadhaarLast4: '4829',
                boothId: booth1._id
            },
            {
                voterId: 'VOTER-002',
                password: 'Test@1234',
                email: 'voter2@test.com',
                fullName: 'Ananya Hegde',
                epicNumber: 'KA/01/172/100002',
                aadhaarLast4: '8192',
                boothId: booth1._id
            },
            {
                voterId: 'VOTER-003',
                password: 'Test@1234',
                email: 'voter3@test.com',
                fullName: 'Syed Mustafa',
                epicNumber: 'KA/01/172/100003',
                aadhaarLast4: '1029',
                boothId: booth1._id
            },

            // Booth 2: Madiwala Primary School (BTM Layout)
            {
                voterId: 'VOTER-004',
                password: 'Test@1234',
                email: 'voter4@test.com',
                fullName: 'Deepak Gowda',
                epicNumber: 'KA/01/172/100004',
                aadhaarLast4: '5931',
                boothId: booth2._id
            },
            {
                voterId: 'VOTER-005',
                password: 'Test@1234',
                email: 'voter5@test.com',
                fullName: 'Sunita Rao',
                epicNumber: 'KA/01/172/100005',
                aadhaarLast4: '7724',
                boothId: booth2._id
            },

            // Booth 3: National College Jayanagar (Jayanagar)
            {
                voterId: 'VOTER-006',
                password: 'Test@1234',
                email: 'voter6@test.com',
                fullName: 'Vijay Prasad',
                epicNumber: 'KA/01/173/100006',
                aadhaarLast4: '3941',
                boothId: booth3._id
            },
            {
                voterId: 'VOTER-007',
                password: 'Test@1234',
                email: 'voter7@test.com',
                fullName: 'Meenakshi Sundaram',
                epicNumber: 'KA/01/173/100007',
                aadhaarLast4: '9012',
                boothId: booth3._id
            },
            {
                voterId: 'VOTER-008',
                password: 'Test@1234',
                email: 'voter8@test.com',
                fullName: 'Rahul Dravid',
                epicNumber: 'KA/01/173/100008',
                aadhaarLast4: '1984',
                boothId: booth3._id
            },

            // Booth 4: HAL Public School (C.V. Raman Nagar)
            {
                voterId: 'VOTER-009',
                password: 'Test@1234',
                email: 'voter9@test.com',
                fullName: 'Kavya Rao',
                epicNumber: 'KA/01/174/100009',
                aadhaarLast4: '6120',
                boothId: booth4._id
            },
            {
                voterId: 'VOTER-010',
                password: 'Test@1234',
                email: 'voter10@test.com',
                fullName: 'Mohammed Zameer',
                epicNumber: 'KA/01/174/100010',
                aadhaarLast4: '4489',
                boothId: booth4._id
            },
        ]);
        console.log(`Seeded exactly ${voters.length} registered voters.`);

        // Update voterCount on each booth
        await Booth.findByIdAndUpdate(booth1._id, { voterCount: 3 });
        await Booth.findByIdAndUpdate(booth2._id, { voterCount: 2 });
        await Booth.findByIdAndUpdate(booth3._id, { voterCount: 3 });
        await Booth.findByIdAndUpdate(booth4._id, { voterCount: 2 });

        // ── 4. ADMIN & POLLING OFFICERS ────────────────────────────
        await Admin.create([
            {
                adminId: 'ADMIN-001',
                password: 'Admin@1234',
                email: 'chief.officer@karnataka.gov.in',
                role: 'SUPER_ADMIN',
            },
            {
                adminId: 'OFFICER-BTM',
                password: 'Officer@1234',
                email: 'officer.btm@karnataka.gov.in',
                role: 'BOOTH_ADMIN',
                boothId: booth1._id,
            }
        ]);
        console.log(`Seeded Super Admin and Polling Officers.`);

        // ── 5. SAMPLE AUDIT LOG ────────────────────────────────────
        await AuditLog.create({
            action: 'ADMIN_LOGIN',
            actorId: 'ADMIN-001',
            actorRole: 'ADMIN',
            success: true,
            metadata: { note: 'Karnataka State Assembly Seed — 10 Registered Voters' },
        });
        console.log('Seeded audit log entry.');

        console.log('\n======================================================');
        console.log('🎉 10 KARNATAKA VOTERS SEEDED SUCCESSFULLY');
        console.log('======================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('Seed failed:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seed();