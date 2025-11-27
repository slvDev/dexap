import {
  createClient,
  getToken,
  getWrappedNativeToken,
  getSupportedChains,
  getChainTokens,
  ChainId,
  DexType,
} from "../index";

async function main() {
  console.log("Token Manager Example\n");

  const client = createClient({
    alchemyKey: "API_KEY",
  });

  // Example 1: Get tokens using helper functions
  console.log("Getting WETH and USDC on Ethereum...");
  const weth = getToken("WETH", ChainId.ETHEREUM)!;
  const usdc = getToken("USDC", ChainId.ETHEREUM)!;

  console.log(`${weth.symbol}: ${weth.name} (${weth.address})`);
  console.log(`${usdc.symbol}: ${usdc.name} (${usdc.address})\n`);

  // Example 2: Get wrapped native token
  console.log("Getting wrapped native tokens...");
  const ethWrappedNative = getWrappedNativeToken(ChainId.ETHEREUM)!;
  const bscWrappedNative = getWrappedNativeToken(ChainId.BSC)!;
  const polyWrappedNative = getWrappedNativeToken(ChainId.POLYGON)!;

  console.log(`Ethereum: ${ethWrappedNative.symbol}`);
  console.log(`BSC: ${bscWrappedNative.symbol}`);
  console.log(`Polygon: ${polyWrappedNative.symbol}\n`);

  // Example 3: Find chains supporting a token
  console.log("Chains supporting USDC:");
  const usdcChains = getSupportedChains("USDC");
  console.log(`Found on ${usdcChains.length} chains\n`);

  // Example 4: Get all tokens on a chain
  console.log("Tokens available on Polygon:");
  const polygonTokens = getChainTokens(ChainId.POLYGON);
  polygonTokens.forEach((token) => {
    console.log(`  ${token.symbol}: ${token.name}`);
  });
  console.log();

  // Example 5: Get price using tokens
  console.log("Fetching WETH/USDC price on Ethereum...");
  try {
    const price = await client.getPrice(weth, usdc, "1", DexType.UNISWAP_V3);
    console.log(`Price: ${price.formatted}`);
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

main();
