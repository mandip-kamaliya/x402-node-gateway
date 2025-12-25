require("dotenv").config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
const PORT = 3000;

// CONFIGURATION
const PROVIDER_URL = "https://evm-t3.cronos.org"; // Cronos Testnet
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const MERCHANT_WALLET = process.env.MERCHANT_WALLET;
const PRICE = "0.01";

// MIDDLEWARE: The x402 Gatekeeper
const checkPayment = async (req, res, next) => {
    // 1. Check if user sent a payment receipt (Tx Hash)
    const txHash = req.headers['x-payment-hash'];

    if (!txHash) {
        console.log(`[Server] ⛔ Blocking user. Demanding ${PRICE} TCRO.`);
        // Return 402 Error with payment instructions
        return res.status(402).json({
            error: "Payment Required",
            pay_to: MERCHANT_WALLET,
            amount: PRICE,
            currency: "TCRO"
        });
    }

    // 2. Verify the receipt on blockchain
    try {
        const tx = await provider.getTransaction(txHash);
        
        // Validation: Did they pay ME? Did they pay ENOUGH?
        if (tx && tx.to.toLowerCase() === MERCHANT_WALLET.toLowerCase()) {
            const paidAmount = ethers.formatEther(tx.value);
            if (parseFloat(paidAmount) >= parseFloat(PRICE)) {
                console.log(`[Server] ✅ Payment Verified: ${txHash}`);
                return next(); // SUCCESS! Let them proceed.
            }
        }
        res.status(403).json({ error: "Payment invalid or insufficient" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Blockchain verification failed" });
    }
};

