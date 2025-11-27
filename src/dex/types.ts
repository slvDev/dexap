import { PublicClient } from "viem";
import { ChainId, Token, PriceResult, DexType, TierType } from "../types";

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
  tiers: number[];
  tierType: TierType;
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

  getQuoteForPoolParam(
    client: PublicClient,
    tokenIn: Token,
    tokenOut: Token,
    amountIn: bigint,
    poolParam: number
  ): Promise<PriceResult | null>;
}
