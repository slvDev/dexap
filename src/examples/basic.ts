import { createClient, ChainId, getWETH, getUSDC, DexType } from "../index";

async function main() {
  console.log("Fetching best WETH/USDC price across all fee tiers...\n");

  const client = createClient();

  try {
    const result = await client.getPrice(
      getWETH(ChainId.ETHEREUM),
      getUSDC(ChainId.ETHEREUM),
      "1",
      DexType.UNISWAP_V3
    );

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
