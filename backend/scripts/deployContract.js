require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Starting Smart Contract Deployment to Local Blockchain (Ganache)...');

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    // Default to Ganache Account 0 private key if not set
    const privateKey = process.env.ADMIN_PRIVATE_KEY && !process.env.ADMIN_PRIVATE_KEY.includes('abcdef')
        ? process.env.ADMIN_PRIVATE_KEY
        : '0xe930c0080d95822d778396e2722e2e8136b7fe25e2d83828c05e70176e25dcfe';

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`📡 Connected to RPC: ${rpcUrl}`);
    console.log(`🔑 Deploying from Account: ${wallet.address}`);

    // Compile VotingSystem.sol using solc if available
    let abi, bytecode;
    const contractPath = path.join(__dirname, '../contracts/VotingSystem.sol');
    const jsonPath = path.join(__dirname, '../contracts/VotingSystem.json');

    try {
        const solc = require('solc');
        const source = fs.readFileSync(contractPath, 'utf8');
        const input = {
            language: 'Solidity',
            sources: {
                'VotingSystem.sol': { content: source }
            },
            settings: {
                outputSelection: {
                    '*': { '*': ['abi', 'evm.bytecode'] }
                }
            }
        };

        console.log('⚙️ Compiling VotingSystem.sol...');
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        if (output.errors) {
            const errors = output.errors.filter(e => e.severity === 'error');
            if (errors.length > 0) {
                console.error('Compilation errors:', errors);
                process.exit(1);
            }
        }

        const contractOutput = output.contracts['VotingSystem.sol']['VotingSystem'];
        abi = contractOutput.abi;
        bytecode = contractOutput.evm.bytecode.object;

        // Save ABI back to VotingSystem.json
        fs.writeFileSync(jsonPath, JSON.stringify({ contractName: 'VotingSystem', abi }, null, 2));
        console.log('✅ Compiled successfully & updated backend/contracts/VotingSystem.json');
    } catch (err) {
        console.log('⚠️ solc not found, reading existing VotingSystem.json...');
        const contractJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        abi = contractJson.abi;
        bytecode = contractJson.bytecode;
        if (!bytecode) {
            console.error('❌ Bytecode missing. Installing solc...');
            throw new Error('Please run: npm install solc');
        }
    }

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log('⏳ Deploying contract to Ganache...');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const deployedAddress = await contract.getAddress();
    console.log(`\n🎉 Smart Contract Deployed Successfully!`);
    console.log(`📍 Contract Address: ${deployedAddress}`);

    // Update .env file with new CONTRACT_ADDRESS and ADMIN_PRIVATE_KEY
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (envContent.includes('CONTRACT_ADDRESS=')) {
            envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${deployedAddress}`);
        } else {
            envContent += `\nCONTRACT_ADDRESS=${deployedAddress}`;
        }

        if (envContent.includes('BLOCKCHAIN_RPC_URL=')) {
            envContent = envContent.replace(/BLOCKCHAIN_RPC_URL=.*/, `BLOCKCHAIN_RPC_URL=${rpcUrl}`);
        } else {
            envContent += `\nBLOCKCHAIN_RPC_URL=${rpcUrl}`;
        }

        if (envContent.includes('ADMIN_PRIVATE_KEY=')) {
            envContent = envContent.replace(/ADMIN_PRIVATE_KEY=.*/, `ADMIN_PRIVATE_KEY=${privateKey}`);
        } else {
            envContent += `\nADMIN_PRIVATE_KEY=${privateKey}`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log(`✅ Updated backend/.env with CONTRACT_ADDRESS=${deployedAddress}`);
    }

    console.log('\n✨ You are ready! Restart your backend server (npm run dev) to run in LIVE Blockchain mode!');
}

main().catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
});
