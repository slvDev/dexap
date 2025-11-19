import { createPublicClient, http, parseUnits, PublicClient } from "viem";
import {
  ChainId,
  ChainKey,
  Token,
  PriceResult,
  DexType,
  AggregatedPrice,
} from "../types";
import { getAllChainConfigs } from "../chains";
import { getViemChain } from "../utils/viemChains";
import { getAlchemyUrl, getInfuraUrl } from "./providers";
import { createAllDexAdapters, createDexAdapter } from "../dex";
import { calculateAggregatedPrice } from "../utils/aggregation";

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
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    dexType: DexType
  ): Promise<PriceResult> {
    const client = this.getClient(tokenIn.chainId);
    const dexAdapter = createDexAdapter(tokenIn.chainId, dexType);
    const amountInWei = parseUnits(amountIn, tokenIn.decimals);
    const quote = await dexAdapter.getQuote(
      client,
      tokenIn,
      tokenOut,
      amountInWei
    );
    return quote;
  }

  async getPricesFromAllDexes(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string
  ): Promise<Array<PriceResult & { dexType: DexType }>> {
    const client = this.getClient(tokenIn.chainId);
    const amountInWei = parseUnits(amountIn, tokenIn.decimals);
    const adapters = createAllDexAdapters(tokenIn.chainId);

    const results = await Promise.allSettled(
      adapters.map(async (adapter) => {
        const result = await adapter.getQuote(
          client,
          tokenIn,
          tokenOut,
          amountInWei
        );
        return { ...result, dexType: adapter.config.protocol.type };
      })
    );

    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  }

  async getBestPrice(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string
  ): Promise<PriceResult & { dexType: DexType }> {
    const prices = await this.getPricesFromAllDexes(
      tokenIn,
      tokenOut,
      amountIn
    );

    if (prices.length === 0) {
      throw new Error(
        `No prices found for ${tokenIn.symbol}/${tokenOut.symbol} on chain ${tokenIn.chainId}`
      );
    }

    return prices.reduce((best, current) =>
      BigInt(current.amountOut) > BigInt(best.amountOut) ? current : best
    );
  }

  async getAggregatedPrice(
    tokenIn: Token,
    tokenOut: Token,
    amountIn: string,
    filterOutliers: boolean = true
  ): Promise<AggregatedPrice> {
    const quotes = await this.getPricesFromAllDexes(
      tokenIn,
      tokenOut,
      amountIn
    );

    return calculateAggregatedPrice(quotes, tokenIn, tokenOut, filterOutliers);
  }
}

export function createClient(config: ClientConfig = {}): Client {
  return new Client(config);
}
