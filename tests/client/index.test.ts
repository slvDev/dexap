import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client, createClient } from "../../src/client";
import { ChainId, DexType } from "../../src/types";
import {
  createMockPublicClient,
  createMockPriceResultWithDex,
} from "../helpers/mocks";
import * as dexModule from "../../src/dex";
import * as aggregationModule from "../../src/utils/aggregation";

describe("Client", () => {
  describe("constructor - RPC URL priority", () => {
    it("uses custom rpcUrls when provided", () => {
      const client = new Client({
        rpcUrls: { mainnet: "https://custom.rpc" },
        alchemyKey: "alchemy-key",
      });

      const publicClient = client.getClient(ChainId.ETHEREUM);
      const rpcUrl = publicClient.transport.url;
      expect(rpcUrl).toBe("https://custom.rpc");
    });

    it("falls back to Alchemy when no custom rpcUrls provided", () => {
      const client = new Client({ alchemyKey: "test-key" });

      const publicClient = client.getClient(ChainId.ETHEREUM);
      const rpcUrl = publicClient.transport.url;
      expect(rpcUrl).toContain("alchemy.com");
      expect(rpcUrl).toContain("test-key");
    });

    it("falls back to Infura when no custom rpcUrls or Alchemy", () => {
      const client = new Client({ infuraKey: "test-key" });

      const publicClient = client.getClient(ChainId.ETHEREUM);
      const rpcUrl = publicClient.transport.url;
      expect(rpcUrl).toContain("infura.io");
      expect(rpcUrl).toContain("test-key");
    });

    it("falls back to public RPC when no config provided", () => {
      const client = new Client();

      expect(() => client.getClient(ChainId.ETHEREUM)).not.toThrow();
    });

    it("skips Infura and uses public RPC when Infura returns null", () => {
      const client = new Client({ infuraKey: "test-key" });

      const publicClient = client.getClient(ChainId.ZORA);
      const rpcUrl = publicClient.transport.url;

      expect(rpcUrl).not.toContain("infura");
      expect(rpcUrl).toBeTruthy();
    });
  });

  describe("getClient - caching", () => {
    it("returns same instance on repeated calls", () => {
      const client = new Client();

      const client1 = client.getClient(ChainId.ETHEREUM);
      const client2 = client.getClient(ChainId.ETHEREUM);

      expect(client1).toBe(client2);
    });

    it("returns different instances for different chains", () => {
      const client = new Client();

      const ethClient = client.getClient(ChainId.ETHEREUM);
      const bscClient = client.getClient(ChainId.BSC);

      expect(ethClient).not.toBe(bscClient);
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("getBestPrice throws when no DEXes return prices", async () => {
      const client = new Client();

      vi.spyOn(client, "getPricesFromAllDexes").mockResolvedValue([]);

      await expect(
        client.getBestPrice("WETH", "USDC", "1", ChainId.ETHEREUM)
      ).rejects.toThrow("No prices found");
    });

    it("getAggregatedPrice throws when no DEXes return prices", async () => {
      const client = new Client();

      vi.spyOn(client, "getPricesFromAllDexes").mockResolvedValue([]);

      await expect(
        client.getAggregatedPrice("WETH", "USDC", "1", ChainId.ETHEREUM)
      ).rejects.toThrow("No prices found");
    });
  });

  describe("getAggregatedPrice - filterOutliers parameter", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("passes filterOutliers=false to aggregation function", async () => {
      const client = new Client();

      const mockPrices = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, {
          amountOut: "2000000000",
          price: 2000,
        }),
      ];

      vi.spyOn(client, "getPricesFromAllDexes").mockResolvedValue(mockPrices);

      const calculateSpy = vi.spyOn(
        aggregationModule,
        "calculateAggregatedPrice"
      );

      await client.getAggregatedPrice(
        "WETH",
        "USDC",
        "1",
        ChainId.ETHEREUM,
        false
      );

      expect(calculateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        false
      );
    });
  });

  describe("getBestPrice - selection logic", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("selects price with highest amountOut", async () => {
      const client = new Client();

      const mockPrices = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, {
          amountOut: "2000000000",
        }),
        createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
          amountOut: "2100000000",
        }),
        createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
          amountOut: "1900000000",
        }),
      ];

      vi.spyOn(client, "getPricesFromAllDexes").mockResolvedValue(mockPrices);

      const result = await client.getBestPrice(
        "WETH",
        "USDC",
        "1",
        ChainId.BSC
      );

      expect(result.dexType).toBe(DexType.SUSHISWAP_V3);
      expect(result.amountOut).toBe("2100000000");
    });

    it("handles BigInt comparison correctly for large amounts", async () => {
      const client = new Client();

      const mockPrices = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, {
          amountOut: "999999999999999999999",
        }),
        createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
          amountOut: "1000000000000000000000",
        }),
      ];

      vi.spyOn(client, "getPricesFromAllDexes").mockResolvedValue(mockPrices);

      const result = await client.getBestPrice(
        "WETH",
        "USDC",
        "1000",
        ChainId.ETHEREUM
      );

      expect(result.dexType).toBe(DexType.SUSHISWAP_V3);
    });
  });

  describe("getPricesFromAllDexes - error resilience", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("returns only successful quotes when some DEXes fail", async () => {
      const client = new Client();
      const mockClient = createMockPublicClient();

      vi.spyOn(client, "getClient").mockReturnValue(mockClient);

      const mockSuccessResult = createMockPriceResultWithDex(
        DexType.UNISWAP_V3
      );

      const mockAdapter1 = {
        config: { protocol: { type: DexType.UNISWAP_V3 } },
        getQuote: vi.fn().mockResolvedValue(mockSuccessResult),
      };
      const mockAdapter2 = {
        config: { protocol: { type: DexType.SUSHISWAP_V3 } },
        getQuote: vi.fn().mockRejectedValue(new Error("Pool not found")),
      };

      vi.spyOn(dexModule, "createAllDexAdapters").mockReturnValue([
        mockAdapter1,
        mockAdapter2,
      ] as any);

      const results = await client.getPricesFromAllDexes(
        "WETH",
        "USDC",
        "1",
        ChainId.ETHEREUM
      );

      expect(results).toHaveLength(1);
      expect(results[0].dexType).toBe(DexType.UNISWAP_V3);
    });
  });

  describe("createClient factory", () => {
    it("returns Client instance", () => {
      const client = createClient();
      expect(client).toBeInstanceOf(Client);
    });
  });
});
