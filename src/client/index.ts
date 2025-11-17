import { createPublicClient, http, PublicClient } from "viem";
import { ChainId, ChainKey, Token, PriceResult } from "../types";
import { getAllChainConfigs } from "../chains";
import { getViemChain } from "../utils/viemChains";
import { getPrice as getPriceImpl } from "./getPrice";
import { getAlchemyUrl, getInfuraUrl } from "./providers";

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
    amountIn: string
  ): Promise<PriceResult> {
    const client = this.getClient(tokenIn.chainId);
    const rpcUrl = this.getRpcUrl(tokenIn.chainId);
    return getPriceImpl(client, tokenIn, tokenOut, amountIn, rpcUrl);
  }
}

export function createClient(config: ClientConfig = {}): Client {
  return new Client(config);
}
