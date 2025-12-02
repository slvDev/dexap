import { describe, it, expect } from "vitest";
import { CHAIN_CONFIGS, CHAIN_KEY_TO_ID } from "../../src/chains/registry";
import { ChainId, ChainKey } from "../../src/types";

describe("chains/registry", () => {
  describe("registry construction integrity", () => {
    it("each config chainId matches its key in the record", () => {
      // Bug prevention: Prevents mismatch between record key and config.chainId
      // This would break all lookups if registry[1].chainId !== 1
      Object.entries(CHAIN_CONFIGS).forEach(([key, config]) => {
        expect(config.chainId).toBe(Number(key));
      });
    });
  });

  describe("bidirectional mapping consistency", () => {
    it("has same number of entries as CHAIN_CONFIGS", () => {
      // Bug prevention: Missing entries would cause lookup failures
      expect(Object.keys(CHAIN_KEY_TO_ID).length).toBe(
        Object.keys(CHAIN_CONFIGS).length
      );
    });

    it("each key maps to existing chainId in CHAIN_CONFIGS", () => {
      // Bug prevention: Invalid chain ID references would cause runtime errors
      Object.entries(CHAIN_KEY_TO_ID).forEach(([key, chainId]) => {
        expect(CHAIN_CONFIGS[chainId as ChainId]).toBeDefined();
        expect(CHAIN_CONFIGS[chainId as ChainId].key).toBe(key);
      });
    });

    it("is the inverse mapping of CHAIN_CONFIGS keys", () => {
      // Bug prevention: Broken bidirectional mapping would break ID ↔ key conversion
      Object.values(CHAIN_CONFIGS).forEach((config) => {
        expect(CHAIN_KEY_TO_ID[config.key as ChainKey]).toBe(config.chainId);
      });
    });
  });
});
