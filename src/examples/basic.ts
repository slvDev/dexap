import { getPrice, WETH, USDC } from "../index";

const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/API_KEY";

async function main() {
  console.log("Fetching best WETH/USDC price across all fee tiers...\n");

  try {
    const result = await getPrice(WETH, USDC, "1", RPC_URL);

    console.log("\nBest Price\n");
    console.log("Price:", result.formatted);
    console.log("Fee Tier:", `${(result.feeTier / 10000).toFixed(2)}%`);
    console.log("Amount In:", result.amountIn);
    console.log("Amount Out:", result.amountOut);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
