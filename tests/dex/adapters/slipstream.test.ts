import { describe, it, expect, vi, beforeEach } from "vitest";
import { SlipstreamAdapter } from "../../../src/dex/adapters/slipstream";
import { createMockPublicClient } from "../../helpers/mocks";
import { MOCK_TOKENS } from "../../helpers/fixtures";
import { ChainId, DexType } from "../../../src/types";
import { parseEther } from "viem";
import type { PublicClient } from "viem";
import type { DexConfig } from "../../../src/dex/types";

describe("SlipstreamAdapter", () => {
  let adapter: SlipstreamAdapter;
  let mockClient: PublicClient;
  let mockConfig: DexConfig;

  beforeEach(() => {
    mockConfig = {
      protocol: {
        type: DexType.VELODROME,
        name: "Velodrome Slipstream",
        website: "https://velodrome.finance",
      },
      chainId: ChainId.OPTIMISM,
      quoterAddress: "0x254cF9E1E6e233aa1AC962CB9B05b2cfeAaE15b0",
      tiers: [1, 50, 100, 200],
      tierType: "tickSpacing",
    };

    adapter = new SlipstreamAdapter(mockConfig);
    mockClient = createMockPublicClient();
  });

  describe("getQuote - best quote selection", () => {
    it("selects pool with highest amountOut using tickSpacing", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "success", result: [2100000000n, 0n, 0, 160000n] }, // BEST
        { status: "success", result: [1900000000n, 0n, 0, 140000n] },
        { status: "success", result: [1950000000n, 0n, 0, 145000n] },
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "success", result: [2100n, 0n, 0, 50000n] },
        { status: "success", result: [1900n, 0n, 0, 50000n] },
        { status: "success", result: [1950n, 0n, 0, 50000n] },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.amountOut).toBe("2100000000");
      expect(result.poolTier.value).toBe(50);
      expect(result.poolTier.type).toBe("tickSpacing");
    });
  });

  describe("getQuote - error handling", () => {
    it("throws when no liquidity found in any pool", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      await expect(
        adapter.getQuote(
          mockClient,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          parseEther("1")
        )
      ).rejects.toThrow("No liquidity found");
    });
  });

  describe("getQuote - price calculation", () => {
    it("calculates correct price with different token decimals", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
        { symbol: "USDC", address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
        parseEther("1")
      );

      expect(result.price).toBe(2000);
      expect(result.formatted).toContain("2000.00");
    });
  });

  describe("getQuote - price impact calculation", () => {
    it("returns 0 price impact when spot call fails", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "failure", error: new Error("Spot query failed") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.priceImpact).toBe(0);
    });
  });

  describe("getQuoteForPoolParam", () => {
    it("returns null when pool returns zero amountOut", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        { status: "success", result: [0n, 0n, 0, 150000n] },
        { status: "success", result: [2000n, 0n, 0, 50000n] },
      ]);

      const result = await adapter.getQuoteForPoolParam(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1"),
        100
      );

      expect(result).toBeNull();
    });
  });
});
