import { createPublicClient, http, parseUnits, PublicClient } from "viem";
import {
  ChainId,
  ChainKey,
  TokenInput,
  PriceResult,
  DexType,
  AggregatedPrice,
} from "../types";
import { getAllChainConfigs } from "../chains";
import { getViemChain } from "../utils/viemChains";
import { getAlchemyUrl, getInfuraUrl } from "./providers";
import { createAllDexAdapters, createDexAdapter } from "../dex";
import { calculateAggregatedPrice } from "../utils/aggregation";
import { resolveToken } from "../tokens";

export interface ClientConfig {
  alchemyKey?: string;
  infuraKey?: string;
  rpcUrls?: Partial<Record<ChainKey, string>>;
}

export class Client {
  private rpcUrls: Map<ChainId, string> = new Map();
  private clients: Map<ChainId, PublicClient> = new Map();

  constructor(config: ClientConfig = {}) {
    for (const chainConfig of getAllChainConfigs()) {
      const chainKey = chainConfig.key;
      let rpcUrl: string | null = null;

      if (config.rpcUrls?.[chainKey]) {
        rpcUrl = config.rpcUrls[chainKey];
      }

      if (!rpcUrl && config.alchemyKey) {
        rpcUrl = getAlchemyUrl(chainConfig.chainId, config.alchemyKey);
      }

      if (!rpcUrl && config.infuraKey) {
        rpcUrl = getInfuraUrl(chainConfig.chainId, config.infuraKey);
      }

      if (!rpcUrl) {
        rpcUrl = chainConfig.publicRpcUrl;
      }

      this.rpcUrls.set(chainConfig.chainId, rpcUrl);
    }
  }

  private getRpcUrl(chainId: ChainId): string {
    const rpcUrl = this.rpcUrls.get(chainId);
    if (!rpcUrl) {
      throw new Error(`No RPC URL for chain ${chainId}`);
    }
    return rpcUrl;
  }

  getClient(chainId: ChainId): PublicClient {
    const cached = this.clients.get(chainId);
    if (cached) return cached;

    const rpcUrl = this.getRpcUrl(chainId);
    const chain = getViemChain(chainId);
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    this.clients.set(chainId, client);
    return client;
  }

  async getPrice(
    tokenIn: TokenInput,
    tokenOut: TokenInput,
    amountIn: string,
    chainId: ChainId,
    dexType: DexType
  ): Promise<PriceResult> {
    const resolvedIn = resolveToken(tokenIn, chainId);
    const resolvedOut = resolveToken(tokenOut, chainId);

    const client = this.getClient(chainId);
    const dexAdapter = createDexAdapter(chainId, dexType);
    const amountInWei = parseUnits(amountIn, resolvedIn.decimals);

    return dexAdapter.getQuote(client, resolvedIn, resolvedOut, amountInWei);
  }

  async getPricesFromAllDexes(
    tokenIn: TokenInput,
    tokenOut: TokenInput,
    amountIn: string,
    chainId: ChainId
  ): Promise<Array<PriceResult & { dexType: DexType }>> {
    const resolvedIn = resolveToken(tokenIn, chainId);
    const resolvedOut = resolveToken(tokenOut, chainId);

    const client = this.getClient(chainId);
    const amountInWei = parseUnits(amountIn, resolvedIn.decimals);
    const adapters = createAllDexAdapters(chainId);

    const results = await Promise.allSettled(
      adapters.map(async (adapter) => {
        const result = await adapter.getQuote(
          client,
          resolvedIn,
          resolvedOut,
          amountInWei
        );
        return { ...result, dexType: adapter.config.protocol.type };
      })
    );

    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  }

  async getBestPrice(
    tokenIn: TokenInput,
    tokenOut: TokenInput,
    amountIn: string,
    chainId: ChainId
  ): Promise<PriceResult & { dexType: DexType }> {
    const prices = await this.getPricesFromAllDexes(
      tokenIn,
      tokenOut,
      amountIn,
      chainId
    );

    if (prices.length === 0) {
      const resolvedIn = resolveToken(tokenIn, chainId);
      const resolvedOut = resolveToken(tokenOut, chainId);
      throw new Error(
        `No prices found for ${resolvedIn.symbol}/${resolvedOut.symbol} on chain ${chainId}`
      );
    }

    return prices.reduce((best, current) =>
      BigInt(current.amountOut) > BigInt(best.amountOut) ? current : best
    );
  }

  async getAggregatedPrice(
    tokenIn: TokenInput,
    tokenOut: TokenInput,
    amountIn: string,
    chainId: ChainId,
    filterOutliers: boolean = true
  ): Promise<AggregatedPrice> {
    const quotes = await this.getPricesFromAllDexes(
      tokenIn,
      tokenOut,
      amountIn,
      chainId
    );

    if (quotes.length === 0) {
      const resolvedIn = resolveToken(tokenIn, chainId);
      const resolvedOut = resolveToken(tokenOut, chainId);
      throw new Error(
        `No prices found for ${resolvedIn.symbol}/${resolvedOut.symbol} on chain ${chainId}`
      );
    }

    const resolvedIn = quotes[0].tokenIn;
    const resolvedOut = quotes[0].tokenOut;

    return calculateAggregatedPrice(
      quotes,
      resolvedIn,
      resolvedOut,
      filterOutliers
    );
  }
}

export function createClient(config: ClientConfig = {}): Client {
  return new Client(config);
}
