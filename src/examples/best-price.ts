import { createClient, WETH, USDC, ChainId } from "../index";

async function main() {
  console.log("Fetching prices from all DEXes...\n");

  const client = createClient();

  const allPrices = await client.getPricesFromAllDexes(
    WETH[ChainId.ETHEREUM],
    USDC[ChainId.ETHEREUM],
    "1"
  );

  console.log("Prices from all DEXes:");
  for (const price of allPrices) {
    console.log(`${price.dexType}: ${price.formatted}`);
  }

  console.log("\n---\n");

  const bestPrice = await client.getBestPrice(
    WETH[ChainId.ETHEREUM],
    USDC[ChainId.ETHEREUM],
    "1"
  );

  console.log(`Best price: ${bestPrice.formatted}`);
  console.log(`DEX: ${bestPrice.dexType}`);
  console.log(`Fee Tier: ${(bestPrice.feeTier / 10000).toFixed(2)}%`);
}

main();
