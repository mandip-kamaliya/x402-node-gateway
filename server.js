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
}
