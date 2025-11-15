import { getPrice, WETH, USDC } from "./index";

const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/API_KEY";

async function main() {
  console.log("Fetching WETH/USDC price from Uniswap V3...\n");

  try {
    const result = await getPrice(WETH, USDC, "1", RPC_URL);

    console.log("Formatted:", result.formatted);
    console.log("Price:", result.price);
    console.log("Amount In:", result.amountIn);
    console.log("Amount Out:", result.amountOut);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
