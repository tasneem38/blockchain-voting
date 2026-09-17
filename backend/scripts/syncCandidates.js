require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const set4StateCandidates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        // Clear candidates collection so ONLY 4 candidates remain
        await Candidate.deleteMany({});
        console.log('🧹 Cleared candidates collection.');

        // Exact 4 State-Wide Candidates for Karnataka Election
        const stateCandidates = [
            {
                candidateId: 'CAND-KA-01',
                name: 'Ramalinga Reddy',
                party: 'Indian National Congress (INC)',
                constituency: 'Karnataka State Constituency',
                electionType: 'Karnataka State Assembly',
            },
            {
                candidateId: 'CAND-KA-02',
                name: 'Sridhara Reddy',
                party: 'Bharatiya Janata Party (BJP)',
                constituency: 'Karnataka State Constituency',
                electionType: 'Karnataka State Assembly',
            },
            {
                candidateId: 'CAND-KA-03',
                name: 'K. V. Gowda',
                party: 'Janata Dal (Secular)',
                constituency: 'Karnataka State Constituency',
                electionType: 'Karnataka State Assembly',
            },
            {
                candidateId: 'CAND-KA-04',
                name: 'Anand Kumar',
                party: 'Aam Aadmi Party (AAP)',
                constituency: 'Karnataka State Constituency',
                electionType: 'Karnataka State Assembly',
            },
        ];

        await Candidate.insertMany(stateCandidates);

        const allCandidates = await Candidate.find();
        console.log('\n======================================================');
        console.log(`🗳️ EXACTLY ${allCandidates.length} STATE-WIDE CANDIDATES CONFIGURED FOR ALL VOTERS:`);
        console.log('======================================================');
        allCandidates.forEach((c, idx) => {
            console.log(`${idx + 1}. [${c.candidateId}] ${c.name} - ${c.party}`);
        });
        console.log('======================================================\n');

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error('❌ Error updating candidates:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

set4StateCandidates();
