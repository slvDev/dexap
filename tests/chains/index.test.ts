import { describe, it, expect } from "vitest";
import { getChainConfig } from "../../src/chains";
import { ChainId } from "../../src/types";

describe("chains", () => {
  describe("getChainConfig", () => {
    it("should return config for Ethereum", () => {
      const config = getChainConfig(ChainId.ETHEREUM);

      expect(config.chainId).toBe(ChainId.ETHEREUM);
      expect(config.name).toBe("Ethereum");
      expect(config.key).toBe("mainnet");
    });
  });
});
