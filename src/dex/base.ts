import { PublicClient } from "viem";
import { Token, PriceResult, PoolTier } from "../types";
import { IDexAdapter, DexConfig } from "./types";

export abstract class BaseDexAdapter implements IDexAdapter {
  constructor(public readonly config: DexConfig) {}

  abstract readonly quoterAbi: any;

  abstract getQuote(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint
  ): Promise<PriceResult>;

  abstract getQuoteForPoolParam(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint,
    poolParam: number
  ): Promise<PriceResult | null>;

  protected validateTokens(tokenIn: Token, tokenOut: Token): void {
    if (tokenIn.chainId !== this.config.chainId) {
      throw new Error(
        `TokenIn is on chain ${tokenIn.chainId} but DEX is configured for chain ${this.config.chainId}`
      );
    }
    if (tokenOut.chainId !== this.config.chainId) {
      throw new Error(
        `TokenOut is on chain ${tokenOut.chainId} but DEX is configured for chain ${this.config.chainId}`
      );
    }
    if (tokenIn.chainId !== tokenOut.chainId) {
      throw new Error("TokenIn and TokenOut must be on the same chain");
    }
  }

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
