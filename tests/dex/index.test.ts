import { describe, it, expect } from "vitest";
import { getSupportedDexTypes } from "../../src/dex";
import { ChainId, DexType } from "../../src/types";

describe("dex", () => {
  describe("getSupportedDexTypes", () => {
    it("should return supported DEX types for Ethereum", () => {
      const dexTypes = getSupportedDexTypes(ChainId.ETHEREUM);

      expect(Array.isArray(dexTypes)).toBe(true);
      expect(dexTypes).toContain(DexType.UNISWAP_V3);
    });
  });
});
