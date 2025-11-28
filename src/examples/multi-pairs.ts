import { createClient, ChainId, DexType } from "../index";

async function main() {
  console.log("Testing multiple token pairs on Ethereum...\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  // Define pairs to test - just use symbol strings now!
  const pairs: [string, string][] = [
    ["WETH", "USDC"],
    ["WETH", "USDT"],
    ["WETH", "DAI"],
    ["WBTC", "USDC"],
    ["USDC", "USDT"],
    ["WSTETH", "WETH"],
  ];

  // Fetch all prices in parallel
  const results = await Promise.allSettled(
    pairs.map(async ([tokenIn, tokenOut]) => {
      const label = `${tokenIn}/${tokenOut}`;
      const result = await client.getPrice(
        tokenIn,
        tokenOut,
        "1",
        ChainId.ETHEREUM,
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
