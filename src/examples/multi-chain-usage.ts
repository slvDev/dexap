import { createClient, getToken } from "..";
import { getChainName, getSupportedChainIds } from "../chains";
import { ChainId, DexType } from "../types";

const AMOUNT_IN = "1";

async function main() {
  console.log("Multi-Chain Price Comparison\n");

  console.log("Supported Chains:");
  const chains = getSupportedChainIds();
  chains.forEach((chainId) => {
    console.log(`${chainId}: ${getChainName(chainId)}`);
  });

  // Create client with default public RPCs
  const client = createClient();

  // Or configure with your own RPC URLs using chain keys:
  // const client = createClient({
  //   rpcUrls: {
  //     mainnet: "https://custom.mainnet.rpc.com",
  //     polygon: "https://custom.polygon.rpc.com",
  //   },
  // });

  // Or use Alchemy/Infura:
  // const client = createClient({
  //   alchemyKey: "your-alchemy-key",
  //   infuraKey: "your-infura-key",
  // });

  console.log(`\nWETH/USDC Prices Across Chains (for ${AMOUNT_IN} WETH):`);
  const testChains = [
    ChainId.ETHEREUM,
    ChainId.BSC,
    ChainId.POLYGON,
    ChainId.ARBITRUM,
    ChainId.OPTIMISM,
    ChainId.BASE,
    ChainId.AVALANCHE,
  ];

  const prices = await Promise.allSettled(
    testChains.map(async (chainId) => {
      const weth = getToken("WETH", chainId)!;
      const usdc = getToken("USDC", chainId)!;

      try {
        const quote = await client.getPrice(
          weth,
          usdc,
          AMOUNT_IN,
          DexType.UNISWAP_V3
        );

        return {
          chainId,
          chainName: getChainName(chainId),
          price: parseFloat(quote.price),
          formatted: quote.formatted,
        };
      } catch (error) {
        throw new Error(`Failed on ${getChainName(chainId)}: ${error}`);
      }
    })
  );

  const successfulPrices = prices
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map((r) => r.value);

  const failedPrices = prices
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => r.reason);

  if (failedPrices.length > 0) {
    console.log("\nFailed chains:");
    failedPrices.forEach((error) => {
      console.log(`   ${error.message}`);
    });
    console.log("");
  }

  console.log("\nPrices:");

  if (successfulPrices.length > 0) {
    successfulPrices.forEach((result) => {
      console.log(`${result.chainName}: $${result.price.toFixed(2)}`);
    });
    console.log("");

    if (successfulPrices.length > 1) {
      const priceValues = successfulPrices.map((p) => p.price);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const delta = maxPrice - minPrice;
      const deltaPercent = ((delta / minPrice) * 100).toFixed(2);

      const minChain = successfulPrices.find((p) => p.price === minPrice)!;
      const maxChain = successfulPrices.find((p) => p.price === maxPrice)!;

      console.log("Price Range:");
      console.log(`Min: $${minPrice.toFixed(2)} (${minChain.chainName})`);
      console.log(`Max: $${maxPrice.toFixed(2)} (${maxChain.chainName})`);
      console.log(`Delta: $${delta.toFixed(2)} (${deltaPercent}%)`);
    }
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
