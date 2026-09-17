require('dotenv').config();
const mongoose = require('mongoose');
const Booth = require('../models/Booth');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const AuditLog = require('../models/AuditLog');
const { castVoteOnChain, isElectionOpen } = require('../utils/blockchainService');

const addVoters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        // 1. Fetch existing booths
        const booths = await Booth.find({});
        if (booths.length === 0) {
            console.error('❌ No booths found in database. Please run initial seed first.');
            await mongoose.disconnect();
            process.exit(1);
        }

        const boothMap = {};
        booths.forEach(b => {
            boothMap[b.boothId] = b;
        });

        const booth1 = boothMap['BOOTH-KA-01'];
        const booth2 = boothMap['BOOTH-KA-02'];
        const booth3 = boothMap['BOOTH-KA-03'];
        const booth4 = boothMap['BOOTH-KA-04'];

        // 2. New 5 Voters Data
        const newVotersData = [
            {
                voterId: 'VOTER-011',
                password: 'Test@1234',
                email: 'voter11@test.com',
                fullName: 'Arjun Nair',
                epicNumber: 'KA/01/172/100011',
                aadhaarLast4: '5512',
                boothId: booth1._id,
                boothCode: 'BOOTH-KA-01',
                preferredCandidate: 'CAND-KA-01'
            },
            {
                voterId: 'VOTER-012',
                password: 'Test@1234',
                email: 'voter12@test.com',
                fullName: 'Priyanka Sharma',
                epicNumber: 'KA/01/172/100012',
                aadhaarLast4: '9834',
                boothId: booth2 ? booth2._id : booth1._id,
                boothCode: booth2 ? 'BOOTH-KA-02' : 'BOOTH-KA-01',
                preferredCandidate: 'CAND-KA-02'
            },
            {
                voterId: 'VOTER-013',
                password: 'Test@1234',
                email: 'voter13@test.com',
                fullName: 'Suresh Patil',
                epicNumber: 'KA/01/173/100013',
                aadhaarLast4: '3341',
                boothId: booth3._id,
                boothCode: 'BOOTH-KA-03',
                preferredCandidate: 'CAND-KA-04'
            },
            {
                voterId: 'VOTER-014',
                password: 'Test@1234',
                email: 'voter14@test.com',
                fullName: 'Lakshmi Narayan',
                epicNumber: 'KA/01/173/100014',
                aadhaarLast4: '7710',
                boothId: booth3._id,
                boothCode: 'BOOTH-KA-03',
                preferredCandidate: 'CAND-KA-05'
            },
            {
                voterId: 'VOTER-015',
                password: 'Test@1234',
                email: 'voter15@test.com',
                fullName: 'Farhan Akhtar',
                epicNumber: 'KA/01/174/100015',
                aadhaarLast4: '2049',
                boothId: booth4._id,
                boothCode: 'BOOTH-KA-04',
                preferredCandidate: 'CAND-KA-06'
            },
        ];

        let createdCount = 0;
        const createdVoters = [];

        for (const data of newVotersData) {
            let existing = await User.findOne({ voterId: data.voterId });
            if (!existing) {
                // User.create triggers password hashing pre-save hook
                const user = await User.create({
                    voterId: data.voterId,
                    password: data.password,
                    email: data.email,
                    fullName: data.fullName,
                    epicNumber: data.epicNumber,
                    aadhaarLast4: data.aadhaarLast4,
                    boothId: data.boothId,
                    hasVoted: false
                });

                // Update booth count
                await Booth.findByIdAndUpdate(data.boothId, { $inc: { voterCount: 1 } });

                await AuditLog.create({
                    action: 'ADMIN_ADD_VOTER',
                    actorId: 'ADMIN-001',
                    actorRole: 'SUPER_ADMIN',
                    boothId: data.boothCode,
                    success: true,
                    metadata: { note: `Added voter ${data.voterId} without overwriting database.` }
                });

                createdCount++;
                createdVoters.push({ user, preferredCandidate: data.preferredCandidate, boothCode: data.boothCode });
                console.log(`✨ Added voter ${data.voterId} (${data.fullName}) -> ${data.boothCode}`);
            } else {
                console.log(`ℹ️ Voter ${data.voterId} already exists in database.`);
                createdVoters.push({ user: existing, preferredCandidate: data.preferredCandidate, boothCode: data.boothCode });
            }
        }

        console.log(`\n🎉 Processed 5 voters (Newly created: ${createdCount}). Existing data intact!`);

        const shouldVote = process.argv.includes('--vote') || process.argv.includes('-v');
        if (shouldVote) {
            console.log('\n🗳️ Processing vote casting for the new voters...');
            const isOpen = await isElectionOpen();

            for (const { user, preferredCandidate, boothCode } of createdVoters) {
                if (user.hasVoted) {
                    console.log(`ℹ️ Voter ${user.voterId} has already voted.`);
                    continue;
                }

                if (!isOpen) {
                    console.log(`⚠️ Election is closed. Skipping vote casting for ${user.voterId}.`);
                    continue;
                }

                try {
                    // Check candidate
                    const candidate = await Candidate.findOne({ candidateId: preferredCandidate.toUpperCase() });
                    if (!candidate) {
                        console.error(`❌ Candidate ${preferredCandidate} not found for voter ${user.voterId}`);
                        continue;
                    }

                    // Cast vote on chain / mock chain
                    const { txHash } = await castVoteOnChain(user.voterId, candidate.candidateId, user.boothId.toString());

                    // Update voter record
                    user.hasVoted = true;
                    user.txHash = txHash;
                    await user.save();

                    // Audit Log entry
                    await AuditLog.create({
                        action: 'VOTE_CAST',
                        actorId: user.voterId,
                        actorRole: 'VOTER',
                        boothId: boothCode,
                        candidateId: candidate.candidateId,
                        txHash,
                        success: true,
                        metadata: { note: 'Vote cast for new voter' }
                    });

                    console.log(`🗳️ Vote successfully cast for ${user.voterId} -> Candidate ${candidate.candidateId} (${candidate.name}). TxHash: ${txHash}`);
                } catch (err) {
                    console.error(`❌ Failed to cast vote for ${user.voterId}:`, err.message);
                }
            }
        }

        console.log('\n======================================================');
        console.log('SUMMARY OF 5 NEW VOTERS:');
        console.log('======================================================');
        for (const data of newVotersData) {
            const v = await User.findOne({ voterId: data.voterId });
            console.log(`Voter ID: ${v.voterId} | Pass: ${data.password} | Name: ${v.fullName} | Voted: ${v.hasVoted ? 'YES (' + v.txHash + ')' : 'NO'}`);
        }
        console.log('======================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('❌ Error adding voters:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

addVoters();
