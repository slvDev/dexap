import { describe, it, expect } from "vitest";
import { TOKEN_METADATA } from "../../src/tokens/metadata";

/**
 * These tests validate the structure of AUTO-GENERATED TOKEN_METADATA.
 * They test the generator script output, not module behavior.
 */
describe("TOKEN_METADATA structural invariants", () => {
  it("all tokens have required properties", () => {
    Object.values(TOKEN_METADATA).forEach((metadata) => {
      expect(metadata).toHaveProperty("name");
      expect(metadata).toHaveProperty("decimals");
    });
  });

  it("all decimals are in valid range (0-32)", () => {
    Object.values(TOKEN_METADATA).forEach((metadata) => {
      expect(metadata.decimals).toBeGreaterThanOrEqual(0);
      expect(metadata.decimals).toBeLessThanOrEqual(32);
      expect(Number.isInteger(metadata.decimals)).toBe(true);
    });
  });

  it("all names are non-empty strings", () => {
    Object.values(TOKEN_METADATA).forEach((metadata) => {
      expect(typeof metadata.name).toBe("string");
      expect(metadata.name.length).toBeGreaterThan(0);
    });
  });

  it("all symbols are uppercase strings", () => {
    Object.keys(TOKEN_METADATA).forEach((symbol) => {
      expect(symbol).toBe(symbol.toUpperCase());
      expect(symbol.length).toBeGreaterThan(0);
      expect(symbol).toMatch(/^[A-Z]+$/);
    });
  });
});

describe("TOKEN_METADATA data consistency", () => {
  it("has no duplicate symbols", () => {
    const symbols = Object.keys(TOKEN_METADATA);
    const uniqueSymbols = new Set(symbols);
    expect(symbols.length).toBe(uniqueSymbols.size);
  });

  it("symbol matches expected pattern for crypto tokens", () => {
    Object.keys(TOKEN_METADATA).forEach((symbol) => {
      // Should be 2-10 characters, all uppercase letters
      expect(symbol).toMatch(/^[A-Z]{2,10}$/);
    });
  });
});
