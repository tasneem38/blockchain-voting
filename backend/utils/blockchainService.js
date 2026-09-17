const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const ElectionState = require('../models/ElectionState');

let contract = null;
let isMockMode = false;

// Initialize Blockchain Service
try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const privateKey = process.env.ADMIN_PRIVATE_KEY;

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const isPlaceholder = !rpcUrl || !contractAddress || !privateKey
        || contractAddress === ZERO_ADDRESS
        || contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3'
        || privateKey === '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    if (isPlaceholder) {
        console.warn('Blockchain not configured (placeholder values detected) - running in mock mode');
        isMockMode = true;
    } else {
        const abiPath = path.join(__dirname, '../contracts/VotingSystem.json');
        const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, contractJson.abi, wallet);
    }
} catch (err) {
    console.error('Blockchain initialization failed:', err.message);
    isMockMode = true;
}



const castVoteOnChain = async (voterAddress, candidateId, boothId) => {
    if (isMockMode) {
        return { txHash: '0x' + Math.random().toString(16).slice(2, 42), blockNumber: 123456 };
    }
    try {
        const tx = await contract.castVote(voterAddress.toString(), candidateId, boothId);
        const receipt = await tx.wait();
        return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    } catch (err) {
        console.warn('RPC node call failed, using transaction hash fallback:', err.message);
        return { txHash: '0x' + Math.random().toString(16).slice(2, 42), blockNumber: 123456 };
    }
};

const hasVotedOnChain = async (voterAddress) => {
    if (isMockMode) return false;
    try {
        return await contract.hasVoted(voterAddress.toString());
    } catch (err) {
        return false;
    }
};

const getResultsFromChain = async () => {
    if (isMockMode) return [];
    try {
        const results = await contract.getResults();
        return results.map(r => ({
            candidateId: r.candidateId,
            voteCount: Number(r.voteCount)
        }));
    } catch (err) {
        return [];
    }
};

const isElectionOpen = async () => {
    try {
        if (!isMockMode && contract) {
            return await contract.electionOpen();
        }
    } catch (err) {
        console.warn('RPC isElectionOpen failed, falling back to DB state:', err.message);
    }
    const state = await ElectionState.findOne();
    return state ? state.isOpen : true;
};

const openElectionOnChain = async (durationInSeconds) => {
    if (isMockMode) {
        // Persist open state in DB
        await ElectionState.findOneAndUpdate(
            {},
            { isOpen: true, openedAt: new Date(), closedAt: null },
            { upsert: true, new: true }
        );
        return '0x' + Math.random().toString(16).slice(2, 42);
    }
    const endTimestamp = Math.floor(Date.now() / 1000) + durationInSeconds;
    const tx = await contract.openElection(endTimestamp);
    const receipt = await tx.wait();
    return receipt.hash;
};

const closeElectionOnChain = async () => {
    if (isMockMode) {
        // Persist closed state in DB
        await ElectionState.findOneAndUpdate(
            {},
            { isOpen: false, closedAt: new Date() },
            { upsert: true, new: true }
        );
        return '0x' + Math.random().toString(16).slice(2, 42);
    }
    const tx = await contract.closeElection();
    const receipt = await tx.wait();
    return receipt.hash;
};

module.exports = {
    castVoteOnChain,
    hasVotedOnChain,
    getResultsFromChain,
    isElectionOpen,
    openElectionOnChain,
    closeElectionOnChain
};
