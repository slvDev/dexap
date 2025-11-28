import { createClient, ChainId, DexType } from "../index";

async function main() {
  console.log("Fetching WETH/USDC prices from specific DEXes...\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  try {
    // New simplified API - just use symbol strings!
    const result = await client.getPrice(
      "WETH",
      "USDC",
      "1",
      ChainId.ETHEREUM,
      DexType.UNISWAP_V3
    );

    console.log("\n[Ethereum - Uniswap V3]");
    console.log("Price:", result.formatted);
    console.log("Pool Tier:", result.poolTier.display);
    console.log("Amount In:", result.amountIn);
    console.log("Amount Out:", result.amountOut);
    console.log("Gas Estimate:", result.gasEstimate);
    console.log("Price Impact:", `${result.priceImpact.toFixed(4)}%\n`);

    const resultSushi = await client.getPrice(
      "WETH",
      "USDC",
      "1",
      ChainId.ETHEREUM,
      DexType.SUSHISWAP_V3
    );

    console.log("\n[Ethereum - SushiSwap V3]");
    console.log("Price:", resultSushi.formatted);
    console.log("Pool Tier:", resultSushi.poolTier.display);
    console.log("Amount In:", resultSushi.amountIn);
    console.log("Amount Out:", resultSushi.amountOut);
    console.log("Gas Estimate:", resultSushi.gasEstimate);
    console.log("Price Impact:", `${resultSushi.priceImpact.toFixed(4)}%\n`);

    const resultVelodrome = await client.getPrice(
      "WETH",
      "USDC",
      "1",
      ChainId.OPTIMISM,
      DexType.VELODROME
    );
    console.log("\n[Optimism - Velodrome Slipstream V3]");
    console.log("Price:", resultVelodrome.formatted);
    console.log("Pool Tier:", resultVelodrome.poolTier.display);
    console.log("Amount In:", resultVelodrome.amountIn);
    console.log("Amount Out:", resultVelodrome.amountOut);
    console.log("Gas Estimate:", resultVelodrome.gasEstimate);
    console.log(
      "Price Impact:",
      `${resultVelodrome.priceImpact.toFixed(4)}%\n`
    );

    const resultAerodrome = await client.getPrice(
      "WETH",
      "USDC",
      "1",
      ChainId.BASE,
      DexType.AERODROME
    );
    console.log("\n[Base - Aerodrome Slipstream V3]");
    console.log("Price:", resultAerodrome.formatted);
    console.log("Pool Tier:", resultAerodrome.poolTier.display);
    console.log("Amount In:", resultAerodrome.amountIn);
    console.log("Amount Out:", resultAerodrome.amountOut);
    console.log("Gas Estimate:", resultAerodrome.gasEstimate);
    console.log("Price Impact:", `${resultAerodrome.priceImpact.toFixed(4)}%`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
