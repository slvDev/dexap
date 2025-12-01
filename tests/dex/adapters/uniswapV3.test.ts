import { describe, it, expect, vi, beforeEach } from "vitest";
import { UniswapV3Adapter } from "../../../src/dex/adapters/uniswapV3";
import { createMockPublicClient } from "../../helpers/mocks";
import { MOCK_TOKENS } from "../../helpers/fixtures";
import { ChainId, DexType } from "../../../src/types";
import { parseEther } from "viem";
import type { PublicClient } from "viem";
import type { DexConfig } from "../../../src/dex/types";

describe("UniswapV3Adapter", () => {
  let adapter: UniswapV3Adapter;
  let mockClient: PublicClient;
  let mockConfig: DexConfig;

  beforeEach(() => {
    mockConfig = {
      protocol: {
        type: DexType.UNISWAP_V3,
        name: "Uniswap V3",
        website: "https://uniswap.org",
      },
      chainId: ChainId.ETHEREUM,
      quoterAddress: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      tiers: [100, 500, 3000],
      tierType: "fee",
    };

    adapter = new UniswapV3Adapter(mockConfig);
    mockClient = createMockPublicClient();
  });

  describe("getQuote - best quote selection", () => {
    it("selects pool with highest amountOut as best", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] }, // Pool 1: 2000 USDC
        { status: "success", result: [2100000000n, 0n, 0, 160000n] }, // Pool 2: 2100 USDC (BEST)
        { status: "success", result: [1900000000n, 0n, 0, 140000n] }, // Pool 3: 1900 USDC
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "success", result: [2100n, 0n, 0, 50000n] },
        { status: "success", result: [1900n, 0n, 0, 50000n] },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.amountOut).toBe("2100000000");
      expect(result.poolTier.value).toBe(500);
    });

    it("returns single pool when only one succeeds", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.amountOut).toBe("2000000000");
    });

    it("correctly compares large BigInt amounts", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [999999999999999999999n, 0n, 0, 150000n] },
        {
          status: "success",
          result: [1000000000000000000000n, 0n, 0, 160000n],
        },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "success", result: [2100n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1000")
      );

      expect(result.amountOut).toBe("1000000000000000000000");
    });
  });

  describe("getQuote - error handling", () => {
    it("throws when no liquidity found in any pool", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
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

    it("returns best quote when some pools fail", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "success", result: [2100000000n, 0n, 0, 160000n] },
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "success", result: [2100n, 0n, 0, 50000n] },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.amountOut).toBe("2100000000");
    });
  });

  describe("getQuote - price calculation", () => {
    it("calculates correct price with different token decimals", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [2000n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
        { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        parseEther("1")
      );

      expect(result.price).toBe(2000);
      expect(result.formatted).toContain("2000.00");
    });

    it("calculates price correctly for same-decimal tokens", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [500000000000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [500n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
        { symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 18 },
        parseEther("1")
      );

      expect(result.price).toBe(0.5);
    });

    it("calculates price for very small amounts", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [1000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [1n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        1000n
      );

      expect(result.price).toBeGreaterThan(0);
      expect(result.amountOut).toBe("1000");
    });
  });

  describe("getQuote - price impact calculation", () => {
    it("calculates price impact when spot price differs", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls - 1 WETH = 2000 USDC
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls - 0.001 WETH = 2.1 USDC (spot price is 2100 USDC per WETH)
        { status: "success", result: [2100000n, 0n, 0, 50000n] },
        { status: "failure", error: new Error("Spot failed") },
        { status: "failure", error: new Error("Spot failed") },
      ]);

      const result = await adapter.getQuote(
        mockClient,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        parseEther("1")
      );

      expect(result.priceImpact).toBeGreaterThan(0);
    });

    it("returns 0 price impact when spot call fails", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "failure", error: new Error("Spot query failed") },
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

    it("returns 0 price impact when spotPrice is 0", async () => {
      mockClient.multicall = vi.fn().mockResolvedValue([
        // Actual calls
        { status: "success", result: [2000000000n, 0n, 0, 150000n] },
        { status: "failure", error: new Error("Pool not found") },
        { status: "failure", error: new Error("Pool not found") },
        // Spot calls
        { status: "success", result: [0n, 0n, 0, 50000n] },
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
        3000
      );

      expect(result).toBeNull();
    });
  });
});
