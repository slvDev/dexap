import {
  createClient,
  resolveToken,
  getWrappedNativeToken,
  getSupportedChains,
  getChainTokens,
  getTokenMetadata,
  ChainId,
  DexType,
} from "../index";

async function main() {
  console.log("Token Manager Example\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  // Example 1: Get token metadata (without chain)
  console.log("Getting token metadata...");
  const wethMeta = getTokenMetadata("WETH");
  const usdcMeta = getTokenMetadata("USDC");
  console.log(`WETH: ${wethMeta?.name} (${wethMeta?.decimals} decimals)`);
  console.log(`USDC: ${usdcMeta?.name} (${usdcMeta?.decimals} decimals)\n`);

  // Example 2: Resolve token for a specific chain
  console.log("Resolving tokens on Ethereum...");
  const weth = resolveToken("WETH", ChainId.ETHEREUM);
  const usdc = resolveToken("USDC", ChainId.ETHEREUM);
  console.log(`${weth.symbol}: ${weth.address}`);
  console.log(`${usdc.symbol}: ${usdc.address}\n`);

  // Example 3: Get wrapped native token
  console.log("Getting wrapped native tokens...");
  const ethWrappedNative = getWrappedNativeToken(ChainId.ETHEREUM)!;
  const bscWrappedNative = getWrappedNativeToken(ChainId.BSC)!;
  const polyWrappedNative = getWrappedNativeToken(ChainId.POLYGON)!;

  console.log(`Ethereum: ${ethWrappedNative.symbol}`);
  console.log(`BSC: ${bscWrappedNative.symbol}`);
  console.log(`Polygon: ${polyWrappedNative.symbol}\n`);

  // Example 4: Find chains supporting a token
  console.log("Chains supporting USDC:");
  const usdcChains = getSupportedChains("USDC");
  console.log(`Found on ${usdcChains.length} chains\n`);

  // Example 5: Get all tokens on a chain
  console.log("Tokens available on Polygon:");
  const polygonTokens = getChainTokens(ChainId.POLYGON);
  polygonTokens.forEach((token) => {
    console.log(`  ${token.symbol}`);
  });
  console.log();

  // Example 6: Get price using simplified API (just symbol strings!)
  console.log("Fetching WETH/USDC price on Ethereum...");
  try {
    const price = await client.getPrice(
      "WETH",
      "USDC",
      "1",
      ChainId.ETHEREUM,
      DexType.UNISWAP_V3
    );
    console.log(`Price: ${price.formatted}`);
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

main();
