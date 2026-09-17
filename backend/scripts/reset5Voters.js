require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

async function reset() {
  await mongoose.connect(process.env.MONGO_URI);
  const voterIds = ['VOTER-011', 'VOTER-012', 'VOTER-013', 'VOTER-014', 'VOTER-015'];
  
  // Reset hasVoted and txHash for these 5 voters so user can test voting themselves
  const res = await User.updateMany(
    { voterId: { $in: voterIds } },
    { $set: { hasVoted: false, txHash: null, loginAttempts: 0, isLocked: false, lockedUntil: null } }
  );
  console.log('Reset voters count:', res.modifiedCount);

  // Remove the VOTE_CAST audit logs created for these 5 voters
  const auditRes = await AuditLog.deleteMany({
    actorId: { $in: voterIds },
    action: 'VOTE_CAST'
  });
  console.log('Removed auto-vote audit logs count:', auditRes.deletedCount);

  const updatedUsers = await User.find({ voterId: { $in: voterIds } }, 'voterId email fullName hasVoted boothId');
  console.log('\n--- 5 VOTERS READY FOR TESTING ---');
  updatedUsers.forEach(u => console.log(`${u.voterId} | Name: ${u.fullName} | Email: ${u.email} | HasVoted: ${u.hasVoted}`));

  await mongoose.disconnect();
}

reset().catch(console.error);
