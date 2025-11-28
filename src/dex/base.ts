import { PublicClient } from "viem";
import { TokenInfo, PriceResult, PoolTier } from "../types";
import { IDexAdapter, DexConfig } from "./types";

export abstract class BaseDexAdapter implements IDexAdapter {
  constructor(public readonly config: DexConfig) {}

  abstract readonly quoterAbi: any;

  abstract getQuote(
    client: PublicClient,
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: bigint
  ): Promise<PriceResult>;

  abstract getQuoteForPoolParam(
    client: PublicClient,
    tokenIn: TokenInfo,
    tokenOut: TokenInfo,
    amountIn: bigint,
    poolParam: number
  ): Promise<PriceResult | null>;

  protected createPoolTier(value: number): PoolTier {
    const type = this.config.tierType;
    return {
      type,
      value,
      display:
        type === "fee"
          ? `${(value / 10000).toFixed(2)}% fee`
          : `tickSpacing: ${value}`,
    };
  }
}
