import { describe, it, expect } from "vitest";
import { isSuperchain, ChainId } from "../src/types";

describe("types", () => {
  describe("isSuperchain", () => {
    it("should return true for Base", () => {
      expect(isSuperchain(ChainId.BASE)).toBe(true);
    });

    it("should return false for Ethereum mainnet", () => {
      expect(isSuperchain(ChainId.ETHEREUM)).toBe(false);
    });
  });
});
