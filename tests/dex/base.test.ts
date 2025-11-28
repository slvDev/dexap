import { describe, it, expect } from "vitest";
import { BaseDexAdapter } from "../../src/dex/base";
import { ChainId, DexType, PriceResult, TokenInfo } from "../../src/types";
import { DexConfig } from "../../src/dex/types";
import { PublicClient } from "viem";

class TestDexAdapter extends BaseDexAdapter {
  readonly quoterAbi = [];

  async getQuote(): Promise<PriceResult> {
    throw new Error("Not implemented");
  }

  async getQuoteForPoolParam(): Promise<PriceResult | null> {
    return null;
  }

  // Expose protected method for testing
  public testCreatePoolTier(value: number) {
    return this.createPoolTier(value);
  }
}

describe("BaseDexAdapter", () => {
  describe("createPoolTier", () => {
    it("should create fee-based pool tier", () => {
      const config: DexConfig = {
        protocol: {
          type: DexType.UNISWAP_V3,
          name: "Uniswap V3",
          website: "https://uniswap.org",
        },
        chainId: ChainId.ETHEREUM,
        quoterAddress: "0x0000000000000000000000000000000000000000",
        tiers: [500, 3000, 10000],
        tierType: "fee",
      };

      const adapter = new TestDexAdapter(config);
      const tier = adapter.testCreatePoolTier(3000);

      expect(tier.type).toBe("fee");
      expect(tier.value).toBe(3000);
      expect(tier.display).toBe("0.30% fee");
    });
  });
});
