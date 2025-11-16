// TODO: fix when add more tokens

// import { getPrice, WETH, USDC, USDT, DAI, WBTC, Token } from "../index";

// const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/API_KEY";

// async function testPair(tokenIn: Token, tokenOut: Token) {
//   try {
//     const result = await getPrice(tokenIn, tokenOut, "1", RPC_URL);
//     console.log(
//       `${result.formatted} - ${(result.feeTier / 10000).toFixed(2)}% fee`
//     );
//   } catch (error) {
//     console.log(
//       `Error getting price for ${tokenIn.symbol}/${tokenOut.symbol}: ${error}`
//     );
//   }
// }

// async function main() {
//   console.log("Testing various token pairs:\n");

//   await Promise.all([
//     testPair(WETH, USDC),
//     testPair(WETH, USDT),
//     testPair(WETH, DAI),
//     testPair(WBTC, USDC),
//     testPair(USDC, USDT),
//   ]);
// }

// main();
