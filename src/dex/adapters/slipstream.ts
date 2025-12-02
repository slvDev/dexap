import { PublicClient, formatUnits, parseEther } from "viem";
import {
  TokenInfo,
  PriceResult,
  PoolQuote,
  QuoterV2Response,
} from "../../types";
import { slipQuoterAbi } from "../../abis/quoter";
import { BaseDexAdapter } from "../base";

export class SlipstreamAdapter extends BaseDexAdapter {
  readonly quoterAbi = slipQuoterAbi;
  private readonly SPOT_REFERENCE_AMOUNT = parseEther("0.001");

  private buildQuoteContract(
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: bigint,
    tickSpacing: number
  ) {
    return {
      address: this.config.quoterAddress,
      abi: this.quoterAbi,
      functionName: "quoteExactInputSingle" as const,
      args: [
        {
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amountIn,
          tickSpacing,
          sqrtPriceLimitX96: 0n,
        },
      ] as const,
    };
  }

  private calculatePriceImpact(
    spotCall: { status: string; result?: unknown },
    amountOut: bigint,
    amountIn: bigint
  ): number {
    if (spotCall.status !== "success") return 0;

    const [spotAmountOut] = spotCall.result as QuoterV2Response;
    const spotPrice =
      Number(spotAmountOut) / Number(this.SPOT_REFERENCE_AMOUNT);
    const actualPrice = Number(amountOut) / Number(amountIn);

    if (spotPrice <= 0) return 0;
    return Math.max(0, ((spotPrice - actualPrice) / spotPrice) * 100);
  }

  async getQuote(
    client: PublicClient,
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: bigint
  ): Promise<PriceResult> {
    const tickSpacings = this.config.tiers;

    // Query all tick spacings using multicall + spot price queries for price impact
    const res = await client.multicall({
      contracts: [
        ...tickSpacings.map((tickSpacing) =>
          this.buildQuoteContract(tokenIn, tokenOut, amountIn, tickSpacing)
        ),
        ...tickSpacings.map((tickSpacing) =>
          this.buildQuoteContract(
            tokenIn,
            tokenOut,
            this.SPOT_REFERENCE_AMOUNT,
            tickSpacing
          )
        ),
      ],
      allowFailure: true,
    });

    const numTickSpacings = tickSpacings.length;
    const actualResults = res.slice(0, numTickSpacings);
    const spotResults = res.slice(numTickSpacings);

    const validQuotes: PoolQuote[] = actualResults
      .map((call, index) => {
        if (call.status === "failure") {
          return null;
        }

        const tickSpacing = tickSpacings[index];
        const poolTier = this.createPoolTier(tickSpacing);
        const [amountOut, , , gasEstimate] = call.result as QuoterV2Response;
        const price =
          Number(formatUnits(amountOut, tokenOut.decimals)) /
          Number(formatUnits(amountIn, tokenIn.decimals));

        const priceImpact = this.calculatePriceImpact(
          spotResults[index],
          amountOut,
          amountIn
        );

        return {
          poolTier,
          amountOut,
          price,
          formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
            tokenOut.symbol
          } (${poolTier.display})`,
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

    return {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      amountOut: best.amountOut.toString(),
      price: best.price,
      formatted: best.formatted,
      poolTier: best.poolTier,
      chainId: this.config.chainId,
      gasEstimate: best.gasEstimate.toString(),
      priceImpact: best.priceImpact,
    };
  }

  async getQuoteForPoolParam(
    client: PublicClient,
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: bigint,
    tickSpacing: number
  ): Promise<PriceResult | null> {
    const res = await client.multicall({
      contracts: [
        this.buildQuoteContract(tokenIn, tokenOut, amountIn, tickSpacing),
        this.buildQuoteContract(
          tokenIn,
          tokenOut,
          this.SPOT_REFERENCE_AMOUNT,
          tickSpacing
        ),
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

    const priceImpact = this.calculatePriceImpact(
      spotCall,
      amountOut,
      amountIn
    );
    const poolTier = this.createPoolTier(tickSpacing);

    return {
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      amountOut: amountOut.toString(),
      price,
      formatted: `1 ${tokenIn.symbol} = ${price.toFixed(2)} ${
        tokenOut.symbol
      } (${poolTier.display})`,
      poolTier,
      chainId: this.config.chainId,
      gasEstimate: gasEstimate.toString(),
      priceImpact,
    };
  }
}
