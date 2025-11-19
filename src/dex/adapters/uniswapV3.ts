import { PublicClient, formatUnits } from "viem";
import {
  Token,
  PriceResult,
  FeeTierQuote,
  QuoterV2Response,
} from "../../types";
import { quoterAbi } from "../../abis/quoter";
import { BaseDexAdapter } from "../base";

export class UniswapV3Adapter extends BaseDexAdapter {
  readonly quoterAbi = quoterAbi;

  async getQuote(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint
  ): Promise<PriceResult> {
    this.validateTokens(tokenIn, tokenOut);

    // Query all fee tiers using multicall
    const res = await client.multicall({
      contracts: this.config.feeTiers.map((feeTier) => ({
        address: this.config.quoterAddress,
        abi: this.quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            amountIn,
            fee: feeTier,
            sqrtPriceLimitX96: 0n,
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

        const feeTier = this.config.feeTiers[index];
        const [amountOut] = call.result as QuoterV2Response;
        const price =
          Number(formatUnits(amountOut, tokenOut.decimals)) /
          Number(formatUnits(amountIn, tokenIn.decimals));

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
        `No liquidity found for ${tokenIn.symbol}/${tokenOut.symbol} on ${this.config.protocol.name} (chain ${this.config.chainId})`
      );
    }

    const best = validQuotes.reduce((best, current) =>
      current.amountOut > best.amountOut ? current : best
    );

    console.log(
      `[${this.config.protocol.name}] Found ${validQuotes.length} pools for ${
        tokenIn.symbol
      }/${tokenOut.symbol}, best: ${best.feeTier / 10000}% fee`
    );

    return {
      amountIn: amountIn.toString(),
      amountOut: best.amountOut.toString(),
      price: best.price,
      formatted: best.formatted,
      feeTier: best.feeTier,
      chainId: this.config.chainId,
    };
  }

  async getQuoteForFeeTier(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint,
    feeTier: number
  ): Promise<PriceResult | null> {
    this.validateTokens(tokenIn, tokenOut);

    let result: QuoterV2Response;

    try {
      result = (await client.readContract({
        address: this.config.quoterAddress,
        abi: this.quoterAbi,
        functionName: "quoteExactInputSingle",
        args: [
          {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            amountIn,
            fee: feeTier,
            sqrtPriceLimitX96: 0n,
          },
        ],
      })) as QuoterV2Response;
    } catch (error) {
      return null;
    }

    const [amountOut] = result;

    if (amountOut === BigInt(0)) {
      return null;
    }

    const price =
      Number(formatUnits(amountOut, tokenOut.decimals)) /
      Number(formatUnits(amountIn, tokenIn.decimals));

    return {
      amountIn: amountIn.toString(),
      amountOut: amountOut.toString(),
      price,
      formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
        tokenOut.symbol
      } (${feeTier / 10000}% fee)`,
      feeTier,
      chainId: this.config.chainId,
    };
  }
}
