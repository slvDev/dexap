import { describe, it, expect } from "vitest";
import { getViemChain } from "../../src/utils/viemChains";
import { ChainId } from "../../src/types";

describe("viemChains", () => {
  describe("getViemChain", () => {
    it("returns viem Chain for supported chain IDs", () => {
      const chain = getViemChain(ChainId.ETHEREUM);
      expect(chain.id).toBe(ChainId.ETHEREUM);
      expect(chain.name).toBeTruthy();
    });

    it("throws for unsupported chain ID with descriptive message", () => {
      expect(() => getViemChain(999 as ChainId)).toThrow(
        "No Viem chain found for chain ID: 999"
      );
    });
  });
});
