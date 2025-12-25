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
