import { formatUnits, parseUnits, PublicClient } from "viem";
import { Token, PriceResult, FeeTierQuote, QuoterV2Response } from "../types";
import { quoterAbi } from "../abis/quoter";
import { FEE_TIERS, getQuoterAddress } from "../constants";
import { getChainConfig, getChainName } from "../chains";

export async function getPrice(
  client: PublicClient,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  rpcUrl: string
): Promise<PriceResult> {
  if (tokenIn.chainId !== tokenOut.chainId) {
    throw new Error(
      `Tokens must be on the same chain. TokenIn is on chain ${tokenIn.chainId}, tokenOut is on chain ${tokenOut.chainId}`
    );
  }

  const chainConfig = getChainConfig(tokenIn.chainId);
  if (rpcUrl === chainConfig.publicRpcUrl) {
    console.warn(
      `⚠️  Using public RPC for ${getChainName(
        tokenIn.chainId
      )}. For production, provide your own RPC URL.`
    );
  }

  const amountInWei = parseUnits(amountIn, tokenIn.decimals);
  const quoterAddress = getQuoterAddress(tokenIn.chainId);

  const res = await client.multicall({
    contracts: FEE_TIERS.map((feeTier) => ({
      address: quoterAddress as `0x${string}`,
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
    `[${getChainName(tokenIn.chainId)}] Found ${validQuotes.length} pools for ${
      tokenIn.symbol
    }/${tokenOut.symbol}, best: ${best.feeTier / 10000}% fee`
  );

  return {
    amountIn: amountInWei.toString(),
    amountOut: best.amountOut.toString(),
    price: best.price.toString(),
    formatted: best.formatted,
    feeTier: best.feeTier,
    chainId: tokenIn.chainId,
  };
}
