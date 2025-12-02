import { describe, it, expect } from "vitest";
import { getViemChain } from "../../src/utils/viemChains";
import { ChainId } from "../../src/types";

describe("viemChains", () => {
  describe("getViemChain", () => {
    it("throws for unsupported chain ID with descriptive message", () => {
      expect(() => getViemChain(999 as ChainId)).toThrow(
        "No Viem chain found for chain ID: 999"
      );
    });
  });
});
