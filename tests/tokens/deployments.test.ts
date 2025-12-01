import { describe, it, expect } from "vitest";
import { TOKEN_DEPLOYMENTS } from "../../src/tokens/deployments";
import { TOKEN_METADATA } from "../../src/tokens/metadata";
import { ChainId } from "../../src/types";

/**
 * These tests validate the structure of AUTO-GENERATED TOKEN_DEPLOYMENTS.
 * They test the generator script output, not module behavior.
 */
describe("TOKEN_DEPLOYMENTS structural invariants", () => {
  it("all addresses follow 0x format with 40 hex characters", () => {
    Object.values(TOKEN_DEPLOYMENTS).forEach((deployments) => {
      Object.values(deployments).forEach((deployment) => {
        expect(deployment.address).toMatch(/^0x[a-f0-9]{40}$/i);
        expect(deployment.address.length).toBe(42);
        expect(deployment.address.startsWith("0x")).toBe(true);
      });
    });
  });

  it("all addresses are lowercase", () => {
    Object.values(TOKEN_DEPLOYMENTS).forEach((deployments) => {
      Object.values(deployments).forEach((deployment) => {
        expect(deployment.address).toBe(deployment.address.toLowerCase());
      });
    });
  });

  it("decimalsOverride values are in valid range when present", () => {
    Object.values(TOKEN_DEPLOYMENTS).forEach((deployments) => {
      Object.values(deployments).forEach((deployment) => {
        if (deployment.decimalsOverride !== undefined) {
          expect(deployment.decimalsOverride).toBeGreaterThanOrEqual(0);
          expect(deployment.decimalsOverride).toBeLessThanOrEqual(32);
          expect(Number.isInteger(deployment.decimalsOverride)).toBe(true);
        }
      });
    });
  });

  it("all chainId values are valid ChainId enum values", () => {
    const validChainIds = new Set(
      Object.values(ChainId).filter((v) => typeof v === "number")
    );

    Object.values(TOKEN_DEPLOYMENTS).forEach((deployments) => {
      Object.keys(deployments).forEach((chainIdStr) => {
        const chainId = Number(chainIdStr);
        expect(validChainIds.has(chainId)).toBe(true);
      });
    });
  });
});

describe("TOKEN_DEPLOYMENTS cross-consistency", () => {
  it("all deployment symbols exist in TOKEN_METADATA", () => {
    const metadataSymbols = new Set(Object.keys(TOKEN_METADATA));

    Object.keys(TOKEN_DEPLOYMENTS).forEach((symbol) => {
      expect(metadataSymbols.has(symbol)).toBe(true);
    });
  });

  it("no duplicate addresses within same chain", () => {
    // For each chain, collect all addresses and ensure no duplicates
    const chainAddresses = new Map<ChainId, Set<string>>();

    Object.values(TOKEN_DEPLOYMENTS).forEach((deployments) => {
      Object.entries(deployments).forEach(([chainIdStr, deployment]) => {
        const chainId = Number(chainIdStr) as ChainId;
        if (!chainAddresses.has(chainId)) {
          chainAddresses.set(chainId, new Set());
        }

        const addresses = chainAddresses.get(chainId)!;
        expect(addresses.has(deployment.address)).toBe(false);
        addresses.add(deployment.address);
      });
    });
  });

  it("decimalsOverride only differs from metadata when present", () => {
    Object.entries(TOKEN_DEPLOYMENTS).forEach(([symbol, deployments]) => {
      const metadataDecimals = TOKEN_METADATA[symbol].decimals;

      Object.values(deployments).forEach((deployment) => {
        if (deployment.decimalsOverride !== undefined) {
          // If override exists, it SHOULD differ from metadata (otherwise why override?)
          expect(deployment.decimalsOverride).not.toBe(metadataDecimals);
        }
      });
    });
  });
});
