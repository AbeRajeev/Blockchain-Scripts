// Import the required libraries
require('./server');
const Ethers = require('ethers');
const Etherscan = require('etherscan-api');
const uniswapExchangeAbi = require('./build/uniswapExchangeAbi.json');
const chainlinkTokenAbi = require('./build/chainlinkTokenAbi.json');
require('dotenv').config()


// Set the network to connect to and the Infura API key
const network = 'mainnet';
const infuraApiKey = `${process.env.INFURA_API_KEY}`;

const { ChainId, Token } = require("@uniswap/sdk")
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json")
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json')
// Set the uniswap router address on the Eth mainnet
const uniswapExchangeAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
// Set the Chainlink token address on the Eth mainnet
const chainlinkTokenAddress = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
// Set the Etherscan API key

const etherscanApiKey = Etherscan.init(`${process.env.ETHERSCAN_API_KEY}`);

// Create a provider to connect to the Ethereum blockchain
const provider = new Ethers.providers.InfuraProvider(network, infuraApiKey);


// Set the polling interval in milliseconds
const pollingInterval = 30 * 1000; // 1 minute

// Set the threshold for price fluctuations
const priceFluctuationThreshold = 0.5; // 3%

// Create an instance of the Uniswap Exchange contract
const uniswapExchange = new Ethers.Contract(uniswapExchangeAddress, uniswapExchangeAbi.abi, provider);

// Create an instance of the Chainlink token contract
const chainlinkToken = new Ethers.Contract(chainlinkTokenAddress, chainlinkTokenAbi.abi, provider);

// Variables to store the previous price and the current price
let previousPrice = 0;
let currentPrice = 0;

// Function to get the current price of Chainlink on Uniswap
const main = async () => {
    try {
        // Get the current ETH/LINK token pair on Uniswap
        const ethLinkTokenPair = await uniswapExchange.getTokenPair(chainlinkTokenAddress);

        // Get the token pair details for the ETH/LINK pair
        const tokenPair = await uniswapExchange.getTokenPairDetails(ethLinkTokenPair);

        // Calculate the current price of Chainlink on Uniswap
        currentPrice = tokenPair.reserve1.div(tokenPair.reserve0);

        // Calculate the price fluctuation
        const priceFluctuation = currentPrice.sub(previousPrice).div(previousPrice).mul(100);

        // If the price fluctuation is greater than the threshold, emit a prompt
        if (priceFluctuation.gte(priceFluctuationThreshold)) {
            console.log(`The price of Chainlink on Uniswap has fluctuated by more than ${priceFluctuationThreshold}%!`);
        }
        // Update the previous price
        previousPrice = currentPrice;
        
    } catch (err) {
        console.error(err)
    }

}

main()

// Poll the price
//https://mainnet.infura.io/v3/1377b3ce1fa84ee1a3a4d6533f723c14