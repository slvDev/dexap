import { PublicClient, formatUnits, parseEther } from "viem";
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
  private readonly SPOT_REFERENCE_AMOUNT = parseEther("0.001");

  async getQuote(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint
  ): Promise<PriceResult> {
    this.validateTokens(tokenIn, tokenOut);

    const feeTiers = this.config.feeTiers;

    // Query all fee tiers using multicall + spot price queries for price impact
    const res = await client.multicall({
      contracts: [
        // Actual amount queries
        ...feeTiers.map((feeTier) => ({
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
        // Spot price queries (small amount) for price impact calculation
        ...feeTiers.map((feeTier) => ({
          address: this.config.quoterAddress,
          abi: this.quoterAbi,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn: tokenIn.address,
              tokenOut: tokenOut.address,
              amountIn: this.SPOT_REFERENCE_AMOUNT,
              fee: feeTier,
              sqrtPriceLimitX96: 0n,
            },
          ],
        })),
      ],
      allowFailure: true,
    });

    const numFeeTiers = feeTiers.length;
    const actualResults = res.slice(0, numFeeTiers);
    const spotResults = res.slice(numFeeTiers);

    const validQuotes: FeeTierQuote[] = actualResults
      .map((call, index) => {
        if (call.status === "failure") {
          return null;
        }

        const feeTier = feeTiers[index];
        const [amountOut, , , gasEstimate] = call.result as QuoterV2Response;
        const price =
          Number(formatUnits(amountOut, tokenOut.decimals)) /
          Number(formatUnits(amountIn, tokenIn.decimals));

        // Calculate price impact from spot price
        let priceImpact = 0;
        const spotCall = spotResults[index];
        if (spotCall.status === "success") {
          const [spotAmountOut] = spotCall.result as QuoterV2Response;
          // Spot price = output per unit input at reference amount
          const spotPrice =
            Number(spotAmountOut) / Number(this.SPOT_REFERENCE_AMOUNT);
          // Actual price = output per unit input at actual amount
          const actualPrice = Number(amountOut) / Number(amountIn);
          if (spotPrice > 0) {
            priceImpact = Math.max(
              0,
              ((spotPrice - actualPrice) / spotPrice) * 100
            );
          }
        }

        return {
          feeTier,
          amountOut,
          price,
          formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
            tokenOut.symbol
          } (${feeTier / 10000}% fee)`,
          gasEstimate,
          priceImpact,
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
      gasEstimate: best.gasEstimate.toString(),
      priceImpact: best.priceImpact,
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

    const res = await client.multicall({
      contracts: [
        // Actual amount query
        {
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
        },
        // Spot price query (small amount)
        {
          address: this.config.quoterAddress,
          abi: this.quoterAbi,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn: tokenIn.address,
              tokenOut: tokenOut.address,
              amountIn: this.SPOT_REFERENCE_AMOUNT,
              fee: feeTier,
              sqrtPriceLimitX96: 0n,
            },
          ],
        },
      ],
      allowFailure: true,
    });

    const [actualCall, spotCall] = res;

    if (actualCall.status === "failure") {
      return null;
    }

    const [amountOut, , , gasEstimate] = actualCall.result as QuoterV2Response;

    if (amountOut === 0n) {
      return null;
    }

    const price =
      Number(formatUnits(amountOut, tokenOut.decimals)) /
      Number(formatUnits(amountIn, tokenIn.decimals));

    // Calculate price impact
    let priceImpact = 0;
    if (spotCall.status === "success") {
      const [spotAmountOut] = spotCall.result as QuoterV2Response;
      const spotPrice =
        Number(spotAmountOut) / Number(this.SPOT_REFERENCE_AMOUNT);
      const actualPrice = Number(amountOut) / Number(amountIn);
      if (spotPrice > 0) {
        priceImpact = Math.max(
          0,
          ((spotPrice - actualPrice) / spotPrice) * 100
        );
      }
    }

    return {
      amountIn: amountIn.toString(),
      amountOut: amountOut.toString(),
      price,
      formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
        tokenOut.symbol
      } (${feeTier / 10000}% fee)`,
      feeTier,
      chainId: this.config.chainId,
      gasEstimate: gasEstimate.toString(),
      priceImpact,
    };
  }
}
