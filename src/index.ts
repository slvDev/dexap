import { createPublicClient, http, formatUnits, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { Token, PriceResult, FeeTierQuote, QuoterV2Response } from "./types";
import { quoterAbi } from "./abis/quoter";

export const FEE_TIERS = [100, 500, 3000, 10000];

// Uniswap V3 QuoterV2
const QUOTER_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";

export const WETH: Token = {
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  symbol: "WETH",
  decimals: 18,
};

export const USDC: Token = {
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",
  decimals: 6,
};

export async function getPrice(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  rpcUrl: string
): Promise<PriceResult> {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  });

  const amountInWei = parseUnits(amountIn, tokenIn.decimals);

  console.log(`Checking ${FEE_TIERS.length} fee tiers...`);

  const res = await client.multicall({
    contracts: FEE_TIERS.map((feeTier) => ({
      address: QUOTER_ADDRESS as `0x${string}`,
      abi: quoterAbi,
      functionName: "quoteExactInputSingle",
      args: [
        {
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn: amountInWei,
          fee: feeTier,
          sqrtPriceLimitX96: BigInt(0),
        },
      ],
    })),
    allowFailure: true,
  });

  const validQuotes: FeeTierQuote[] = res
    .map((call, index) => {
      if (call.status === "failure") {
        return null;
      }

      const feeTier = FEE_TIERS[index];
      const [amountOut] = call.result as QuoterV2Response;
      const price =
        Number(formatUnits(amountOut, tokenOut.decimals)) /
        Number(formatUnits(amountInWei, tokenIn.decimals));

      return {
        feeTier,
        amountOut,
        price,
        formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
          tokenOut.symbol
        } (${feeTier / 10000}% fee)`,
      };
    })
    .filter((q) => q !== null);

  if (validQuotes.length === 0) {
    throw new Error(
      `No liquidity found for ${tokenIn.symbol}/${tokenOut.symbol}`
    );
  }

  const best = validQuotes.reduce((best, current) =>
    current.amountOut > best.amountOut ? current : best
  );

  console.log(
    `Found ${validQuotes.length} pools, best: ${best.feeTier / 10000}% fee`
  );

  return {
    amountIn: amountInWei.toString(),
    amountOut: best.amountOut.toString(),
    price: best.price.toString(),
    formatted: best.formatted,
    feeTier: best.feeTier,
  };
}
