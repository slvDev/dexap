import { createClient, getToken, ChainId } from "../index";

async function main() {
  console.log("Fetching prices from all DEXes...\n");

  const client = createClient();

  const weth = getToken("WETH", ChainId.ETHEREUM)!;
  const usdc = getToken("USDC", ChainId.ETHEREUM)!;

  const allPrices = await client.getPricesFromAllDexes(weth, usdc, "1");

  console.log("Prices from all DEXes:");
  for (const price of allPrices) {
    console.log(`${price.dexType}: ${price.formatted}`);
  }

  console.log("\n---\n");

  const bestPrice = await client.getBestPrice(weth, usdc, "1");

  console.log(`Best price: ${bestPrice.formatted}`);
  console.log(`DEX: ${bestPrice.dexType}`);
  console.log(`Fee Tier: ${(bestPrice.feeTier / 10000).toFixed(2)}%`);
}

main();
