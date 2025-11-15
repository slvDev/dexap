import { createPublicClient, http, formatUnits, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { Token, PriceResult } from "./types";
import { quoterAbi } from "./abis/quoter";

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
  amountIn: string = "1",
  rpcUrl: string
): Promise<PriceResult> {
  const client = createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl),
  });

  const amountInWei = parseUnits(amountIn, tokenIn.decimals);

  const result = await client.readContract({
    address: QUOTER_ADDRESS,
    abi: quoterAbi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn: tokenIn.address,
        tokenOut: tokenOut.address,
        amountIn: amountInWei,
        fee: 500, // 0.05%
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });

  const amountOut = result[0] as bigint;

  const amountInFormatted = formatUnits(amountInWei, tokenIn.decimals);
  const amountOutFormatted = formatUnits(amountOut, tokenOut.decimals);

  const price = Number(amountOutFormatted) / Number(amountInFormatted);

  return {
    amountIn: amountInWei.toString(),
    amountOut: amountOut.toString(),
    price: price.toString(),
    formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${tokenOut.symbol}`,
  };
}
