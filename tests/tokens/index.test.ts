import { describe, it, expect } from "vitest";
import { resolveToken } from "../../src/tokens";
import { ChainId } from "../../src/types";

describe("tokens", () => {
  describe("resolveToken", () => {
    it("should resolve WETH token on Ethereum", () => {
      const token = resolveToken("WETH", ChainId.ETHEREUM);

      expect(token).toMatchObject({
        symbol: "WETH",
        decimals: 18,
      });
      expect(token.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});
