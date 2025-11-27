import { createClient, getToken, ChainId } from "../index";

async function main() {
  console.log("Multi-DEX Price Comparison Example\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  const weth = getToken("WETH", ChainId.ETHEREUM)!;
  const usdc = getToken("USDC", ChainId.ETHEREUM)!;

  // Use case 1: When you need ALL prices (for comparison UI, analytics)
  console.log("Use case 1: Get all DEX prices for comparison\n");
  const allPrices = await client.getPricesFromAllDexes(weth, usdc, "1");
  for (const price of allPrices) {
    console.log(
      `  ${price.dexType}: ${
        price.formatted
      } (impact: ${price.priceImpact.toFixed(4)}%)`
    );
  }

  console.log("\n---\n");

  // Use case 2: When you ONLY need best price (simpler API, same RPC cost)
  console.log("Use case 2: Get only the best price\n");
  const bestPrice = await client.getBestPrice(weth, usdc, "1");
  console.log(`  Best: ${bestPrice.formatted}`);
  console.log(`  DEX: ${bestPrice.dexType}`);
  console.log(`  Pool Tier: ${bestPrice.poolTier.display}`);
  console.log(`  Gas Estimate: ${bestPrice.gasEstimate}`);
  console.log(`  Price Impact: ${bestPrice.priceImpact.toFixed(4)}%`);
}

main();
