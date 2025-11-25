import { createClient, getToken, ChainId, DexType } from "../index";

async function main() {
  console.log("Fetching WETH/USDC prices from specific DEXes...\n");

  const client = createClient({
    infuraKey: "API_KEY",
  });

  try {
    const result = await client.getPrice(
      getToken("WETH", ChainId.ETHEREUM)!,
      getToken("USDC", ChainId.ETHEREUM)!,
      "1",
      DexType.UNISWAP_V3
    );

    console.log("[Uniswap V3]");
    console.log("Price:", result.formatted);
    console.log("Fee Tier:", `${(result.feeTier / 10000).toFixed(2)}%`);
    console.log("Amount In:", result.amountIn);
    console.log("Amount Out:", result.amountOut);
    console.log("Gas Estimate:", result.gasEstimate);
    console.log("Price Impact:", `${result.priceImpact.toFixed(4)}%`);

    const resultSushi = await client.getPrice(
      getToken("WETH", ChainId.ETHEREUM)!,
      getToken("USDC", ChainId.ETHEREUM)!,
      "1",
      DexType.SUSHISWAP_V3
    );

    console.log("\n[SushiSwap V3]");
    console.log("Price:", resultSushi.formatted);
    console.log("Fee Tier:", `${(resultSushi.feeTier / 10000).toFixed(2)}%`);
    console.log("Amount In:", resultSushi.amountIn);
    console.log("Amount Out:", resultSushi.amountOut);
    console.log("Gas Estimate:", resultSushi.gasEstimate);
    console.log("Price Impact:", `${resultSushi.priceImpact.toFixed(4)}%`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
