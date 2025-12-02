import { describe, it, expect, beforeAll } from "vitest";
import { createPublicClient, http } from "viem";
import {
  getAllChainConfigs,
  getChainConfig,
  getPublicRpcUrl,
} from "../../src/chains";
import { ChainConfig, ChainId } from "../../src/types";

const ALCHEMY_NETWORKS: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: "eth-mainnet",
  [ChainId.BSC]: "bnb-mainnet",
  [ChainId.POLYGON]: "polygon-mainnet",
  [ChainId.ARBITRUM]: "arb-mainnet",
  [ChainId.AVALANCHE]: "avax-mainnet",
  [ChainId.OPTIMISM]: "opt-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.ZORA]: "zora-mainnet",
  [ChainId.UNICHAIN]: "unichain-mainnet",
  [ChainId.WORLD_CHAIN]: "worldchain-mainnet",
  [ChainId.SONEIUM]: "soneium-mainnet",
};

function buildRpcUrl(config: ChainConfig): string {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (alchemyApiKey) {
    return `https://${
      ALCHEMY_NETWORKS[config.chainId]
    }.g.alchemy.com/v2/${alchemyApiKey}`;
  }
  return config.publicRpcUrl;
}

function createChainClient(config: ChainConfig) {
  return createPublicClient({
    transport: http(buildRpcUrl(config), {
      timeout: 30_000,
      retryCount: 2,
      retryDelay: 1000,
    }),
  });
}

describe("chain RPC integration tests", () => {
  let allConfigs: ChainConfig[];

  beforeAll(() => {
    allConfigs = getAllChainConfigs();
  });

  describe("RPC endpoint connectivity", () => {
    it("connects to each configured chain and verifies chain ID", async () => {
      for (const config of allConfigs) {
        const client = createChainClient(config);
        const reportedChainId = await client.getChainId();
        expect(reportedChainId).toBe(config.chainId);
      }
    }, 300_000);
  });

  describe("RPC endpoint basic functionality", () => {
    it("fetches block number from representative chains", async () => {
      const sampleConfigs = allConfigs.slice(0, 3);

      for (const config of sampleConfigs) {
        const client = createChainClient(config);
        const blockNumber = await client.getBlockNumber();
        expect(typeof blockNumber).toBe("bigint");
        expect(blockNumber).toBeGreaterThan(0n);
      }
    }, 90_000);
  });

  describe("all chains connectivity sweep", () => {
    it("queries chain ID from all configured RPCs", async () => {
      const results: Array<{
        chainId: ChainId;
        name: string;
        success: boolean;
        error?: string;
        reportedChainId?: number;
      }> = [];

      for (const config of allConfigs) {
        try {
          const client = createChainClient(config);
          const reportedChainId = await client.getChainId();
          results.push({
            chainId: config.chainId,
            name: config.name,
            success: reportedChainId === config.chainId,
            reportedChainId,
          });
        } catch (error) {
          results.push({
            chainId: config.chainId,
            name: config.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const failures = results.filter((r) => !r.success);
      expect(failures).toEqual([]);
    }, 180_000);
  });

  describe("public RPC URL consistency", () => {
    it("returns same chain ID via getPublicRpcUrl helper for all chains", async () => {
      for (const config of allConfigs) {
        const rpcUrl = getPublicRpcUrl(config.chainId);
        expect(rpcUrl).toBe(config.publicRpcUrl);

        const client = createPublicClient({
          transport: http(rpcUrl, { timeout: 30_000 }),
        });
        const reportedChainId = await client.getChainId();
        expect(reportedChainId).toBe(config.chainId);
      }
    }, 300_000);
  });
});

describe("integration test infrastructure", () => {
  it("builds RPC URLs correctly", () => {
    const config = getChainConfig(ChainId.ETHEREUM);
    const url = buildRpcUrl(config);
    expect(url).toMatch(/^https:\/\/.+/);
  });

  it("falls back to public RPC when no Alchemy key", () => {
    const originalKey = process.env.ALCHEMY_API_KEY;
    delete process.env.ALCHEMY_API_KEY;

    try {
      const config = getChainConfig(ChainId.ETHEREUM);
      const url = buildRpcUrl(config);
      expect(url).toBe(config.publicRpcUrl);
    } finally {
      if (originalKey) {
        process.env.ALCHEMY_API_KEY = originalKey;
      }
    }
  });

  it("has Alchemy mappings for all configured chains", () => {
    const allConfigs = getAllChainConfigs();
    const missingAlchemySupport: string[] = [];

    allConfigs.forEach((config) => {
      if (!ALCHEMY_NETWORKS[config.chainId]) {
        missingAlchemySupport.push(config.name);
      }
    });

    expect(missingAlchemySupport).toEqual([]);
  });
});
