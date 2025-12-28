// agent.js
require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');

// CONFIGURATION
const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);

async function runBot() {
    const targetUrl = "http://localhost:3000/secret";
    console.log(`🤖 Bot (${wallet.address.slice(0,6)}...) starting...`);

    try {
        // ATTEMPT 1: Try to get data for free
        console.log("1️⃣  Trying to access /secret...");
        await axios.get(targetUrl);

    } catch (error) {
        // We expect a 402 error here
        if (error.response && error.response.status === 402) {
            const { pay_to, amount } = error.response.data;
            console.log(`🛑 Blocked! Server demands: ${amount} TCRO`);

            // ATTEMPT 2: Pay the bill
            console.log(`2️⃣  Paying ${amount} TCRO to ${pay_to.slice(0,6)}...`);
            
            try {
                const tx = await wallet.sendTransaction({
                    to: pay_to,
                    value: ethers.parseEther(amount)
                });
                console.log(`   Tx Sent: ${tx.hash}`);
                
                console.log("⏳ Waiting for confirmation...");
                await tx.wait(); // Wait for block validation

                // ATTEMPT 3: Retry with the Receipt
                console.log("3️⃣  Re-trying with proof of payment...");
                const response = await axios.get(targetUrl, {
                    headers: { 'x-payment-hash': tx.hash }
                });

                console.log("\n🎉 SUCCESS! Server replied:");
                console.log(response.data);

            } catch (txError) {
                console.log("❌ Transaction Failed (Do you have gas?):", txError.message);
            }
        } else {
            console.log("❌ Unexpected Error:", error.message);
        }
    }
}

runBot();