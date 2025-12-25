require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider("https://evm-t3.cronos.org");
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);