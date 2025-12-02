import { describe, it, expect } from "vitest";
import { isSuperchain, getSuperchainChains, ChainId } from "../src/types";

describe("types module", () => {
  describe("isSuperchain - edge case handling", () => {
    it("returns false for null and undefined", () => {
      expect(isSuperchain(undefined as unknown as ChainId)).toBe(false);
      expect(isSuperchain(null as unknown as ChainId)).toBe(false);
    });

    it("returns false for non-existent chain IDs", () => {
      expect(isSuperchain(999999 as ChainId)).toBe(false);
    });

    it("returns false for zero and negative numbers", () => {
      expect(isSuperchain(0 as ChainId)).toBe(false);
      expect(isSuperchain(-1 as ChainId)).toBe(false);
    });
  });

  describe("getSuperchainChains - immutability", () => {
    it("returns new array instance on each call (defensive copy)", () => {
      const result1 = getSuperchainChains();
      const result2 = getSuperchainChains();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    it("does not mutate source when returned array is modified", () => {
      const originalLength = getSuperchainChains().length;
      const originalFirst = getSuperchainChains()[0];
      const result = getSuperchainChains();

      result.push(999 as ChainId);
      result[0] = 0 as ChainId;

      const fresh = getSuperchainChains();
      expect(fresh.length).toBe(originalLength);
      expect(fresh[0]).toBe(originalFirst);
    });
  });
});
