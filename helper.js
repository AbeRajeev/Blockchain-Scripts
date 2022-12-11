require("dotenv").config();
const Web3 = require('web3');

// loading env vars
const HTTP_URL = process.env.INFURA_HTTP;
const WSS_URL = process.env.INFURA_WEBSOCKET;

const web3http = new Web3(HTTP_URL);
const web3ws = new Web3(WSS_URL);

module.exports = { web3http, web3ws }