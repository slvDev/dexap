import { ChainId, getToken, createClient } from "..";

async function main() {
  console.log("Price Aggregation Example\n");

  // Create client (uses public RPCs by default)
  const client = createClient({
    alchemyKey: "API_KEY",
  });

  // Get tokens - testing on Base with multiple DEXes
  const weth = getToken("WETH", ChainId.BASE);
  const usdc = getToken("USDC", ChainId.BASE);

  if (!weth || !usdc) {
    throw new Error("Tokens not found");
  }

  try {
    // 1. Get aggregated price from all DEXes (without filtering)
    console.log("1. Aggregated Price (without filtering):");
    const agg = await client.getAggregatedPrice(weth, usdc, "1.0", false);

    console.log(`   Average: $${agg.average}`);
    console.log(`   Median:  $${agg.median}`);
    console.log(`   Min:     $${agg.min}`);
    console.log(`   Max:     $${agg.max}`);
    console.log(`   Best:    ${agg.best.formatted} (from ${agg.best.dexType})`);
    console.log("");

    // 2. Show all individual quotes
    console.log("2. Individual DEX Quotes:");
    agg.all.forEach((quote) => {
      const spread = ((quote.price - agg.min) / agg.min) * 100;
      console.log(
        `   ${quote.dexType.padEnd(18)} $${quote.price.toFixed(
          2
        )} (spread: ${spread.toFixed(2)}%, impact: ${quote.priceImpact.toFixed(
          4
        )}%)`
      );
    });
    console.log("");

    // 3. With outlier filtering (default behavior)
    console.log("3. With Outlier Filtering (default):");
    const filtered = await client.getAggregatedPrice(weth, usdc, "1.0");
    console.log(
      `   Quotes used: ${filtered.all.length} out of ${agg.all.length}`
    );
    console.log(`   Average (filtered): $${filtered.average}`);
    console.log("");

    // 4. Best execution calculation
    console.log("4. Best Execution:");
    const savings = ((agg.best.price - agg.min) / agg.min) * 100;
    const spread = ((agg.max - agg.min) / agg.min) * 100;
    console.log(`   Use ${agg.best.dexType} for best price`);
    console.log(`   Save ${savings.toFixed(2)}% vs worst DEX`);
    console.log(`   Price spread: ${spread.toFixed(2)}%`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
