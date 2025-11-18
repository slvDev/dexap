import { PublicClient } from "viem";
import { ChainId, Token, PriceResult, DexType } from "../types";

export interface DexProtocol {
  type: DexType;
  name: string;
  website: string;
}

export interface DexConfig {
  protocol: DexProtocol;
  chainId: ChainId;
  quoterAddress: `0x${string}`;
  factoryAddress?: `0x${string}`;
  feeTiers: number[];
}

export interface IDexAdapter {
  readonly config: DexConfig;
  readonly quoterAbi: any;

  getQuote(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint
  ): Promise<PriceResult>;

  getQuoteForFeeTier?(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint,
    feeTier: number
  ): Promise<PriceResult | null>;
}
