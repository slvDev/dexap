import { createClient, getToken, ChainId, DexType } from "../index";

async function main() {
  console.log("Testing multiple token pairs on Ethereum...\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  // Define pairs to test
  const pairs: [string, string][] = [
    ["WETH", "USDC"],
    ["WETH", "USDT"],
    ["WETH", "DAI"],
    ["WBTC", "USDC"],
    ["USDC", "USDT"],
    ["WSTETH", "WETH"],
  ];

  // Resolve tokens
  const resolvedPairs = pairs.map(([inSym, outSym]) => ({
    tokenIn: getToken(inSym, ChainId.ETHEREUM),
    tokenOut: getToken(outSym, ChainId.ETHEREUM),
    label: `${inSym}/${outSym}`,
  }));

  // Check all tokens exist
  for (const { tokenIn, tokenOut, label } of resolvedPairs) {
    if (!tokenIn || !tokenOut) {
      console.error(`Token not found for pair: ${label}`);
      return;
    }
  }

  // Fetch all prices in parallel
  const results = await Promise.allSettled(
    resolvedPairs.map(async ({ tokenIn, tokenOut, label }) => {
      const result = await client.getPrice(
        tokenIn!,
        tokenOut!,
        "1",
        DexType.UNISWAP_V3
      );
      return { label, result };
    })
  );

  // Display results
  console.log("Results:\n");
  console.log("Pair".padEnd(15) + "Price".padEnd(20) + "Pool Tier");
  console.log("-".repeat(50));

  for (const entry of results) {
    if (entry.status === "fulfilled") {
      const { label, result } = entry.value;
      const price = `$${result.price.toFixed(2)}`;
      console.log(
        label.padEnd(15) + price.padEnd(20) + result.poolTier.display
      );
    } else {
      console.log(`Error: ${entry.reason}`);
    }
  }
}

main();
