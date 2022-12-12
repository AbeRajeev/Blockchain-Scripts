const ethers = require('ethers');
require('dotenv').config()

const INFURA_URL_TESTNET = process.env.INFURA_HTTP_GOERLI
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

const { abi: V3SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const path = require('path');

const UniswapV3SwapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
const WETHAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const USDCAddress = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
const UNIAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';

const TSTAddress = '0x7af963cf6d228e564e2a0aa0ddbf06210b38615d'

const swapRouterContract = new ethers.Contract(
    UniswapV3SwapRouterAddress,
    V3SwapRouterABI
)

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET)
const wallet = new ethers.Wallet(WALLET_SECRET)
const signer = wallet.connect(provider)


const FEE_SIZE = 3

function encodePath(path, fees) {
  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match')
  }

  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2)
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0')
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2)

  return encoded.toLowerCase()
}


async function multihopSwap(){

    const deadline = Math.floor(Date.now()/1000) + (60*10)

    // [ tokenAddr1, fee, tokenAddr2, fee, tokenAddr3, fee, tokenAddr4]
    // 0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6000bb81f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8b4fbf271143f4fbf7b91a5ded31805e42b2208d6
    const path = encodePath([TSTAddress,UNIAddress,TSTAddress], [3000,3000])
    //console.log('path', path)

    const params = {
        path: path,
        recipient: WALLET_ADDRESS,
        deadline: deadline,
        amountIn: ethers.utils.parseEther('0.01'),
        amountOutMinimum: 0
    }

    const encodedData = swapRouterContract.interface.encodeFunctionData("exactInput", [params])

    const txArgs = {
        to: UniswapV3SwapRouterAddress,
        from: WALLET_ADDRESS,
        data: encodedData,
        gasLimit: ethers.utils.hexlify(1000000)
    }

    const tx = await signer.sendTransaction(txArgs)
    console.log('tx', tx)
    const receipt = await tx.wait()
    console.log('receipt', receipt)

}

async function main() {
    await multihopSwap()
}

main()