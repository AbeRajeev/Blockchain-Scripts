/* // Import the required libraries
const Web3 = require('web3');
const GasOracle = require('eth-gas-reporter');

// Create a provider to connect to the Ethereum blockchain
const provider = new Web3.providers.HttpProvider(`${process.env.INFURA_HTTP}`);

// Create a gas oracle instance
const gasOracle = new GasOracle(provider);

async function getGasPrice() {
    // Get the current gas price
    const gasPrice = await gasOracle.fast();
  
    // Print the gas price
    console.log(`The current gas price is ${gasPrice} wei.`);
}

getGasPrice();
 */

// Gas tracker with reference ot the implementation of EIP-1559
require("dotenv").config();
const http = require("http");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

// Using WebSockets
const web3 = createAlchemyWeb3(
    `${process.env.ALCHEMY_WEBSOCKET}` // Websocket URL
);

const formatOutput = (data, numBlocks) => {
    let blocksOutput = [];
  
    for (let i = 0; i < numBlocks; i++) {
      blocksOutput.push({
        blockNumber: data.oldestBlock + i,
        baseFeePerGas: Math.round(Number(data.baseFeePerGas[i]) / 10 ** 9),
        gasUsedRatio: data.gasUsedRatio[i],
        reward: data.reward[i].map((r) => Math.round(Number(r) / 10 ** 9)),
      });
    }
  
    return blocksOutput;
};
  
web3.eth.getFeeHistory(20, "latest", [25, 50, 75]).then((data) => {
    console.log(formatOutput(data, 20));
});
  
//create a server object:
http
    .createServer(function (req, res) {
        res.write(
            "Ethereum Gas Price Tracker"
        ); //write a response to the client
        res.end(); //end the response
    })
    .listen(80); //the server object listens on port 80
