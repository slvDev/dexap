import { describe, it, expect } from "vitest";
import { DEX_PROTOCOLS } from "../../src/dex/registry";
import { DexType } from "../../src/types";

describe("dex/protocols", () => {
  describe("DEX_PROTOCOLS", () => {
    describe("structure", () => {
      it("should contain entry for all DexType enum values", () => {
        const dexTypeValues = Object.values(DexType);
        const protocolKeys = Object.keys(DEX_PROTOCOLS);

        dexTypeValues.forEach((dexType) => {
          expect(protocolKeys).toContain(dexType);
        });
      });

      it("should have no extra entries beyond DexType enum", () => {
        const dexTypeValues = Object.values(DexType);
        const protocolKeys = Object.keys(DEX_PROTOCOLS);

        expect(protocolKeys.length).toBe(dexTypeValues.length);
      });

      it("record keys should match DexType values exactly", () => {
        Object.entries(DEX_PROTOCOLS).forEach(([key, protocol]) => {
          expect(protocol.type).toBe(key);
        });
      });
    });

    describe("protocol properties", () => {
      it("all protocols should have required properties", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          expect(protocol).toHaveProperty("type");
          expect(protocol).toHaveProperty("name");
          expect(protocol).toHaveProperty("website");
        });
      });

      it("type should match the record key", () => {
        Object.entries(DEX_PROTOCOLS).forEach(([key, protocol]) => {
          expect(protocol.type).toBe(key);
        });
      });

      it("name should be non-empty string with reasonable length", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          expect(typeof protocol.name).toBe("string");
          expect(protocol.name.length).toBeGreaterThanOrEqual(2);
          expect(protocol.name.length).toBeLessThanOrEqual(20);
        });
      });

      it("website should be valid HTTPS URL", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          expect(protocol.website).toMatch(/^https:\/\/.+/);
        });
      });
    });

    describe("URL validation", () => {
      it("all websites should be parseable URLs", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          expect(() => new URL(protocol.website)).not.toThrow();
        });
      });

      it("all websites should use HTTPS protocol", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          const url = new URL(protocol.website);
          expect(url.protocol).toBe("https:");
        });
      });

      it("all websites should have no trailing slashes", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          expect(protocol.website).not.toMatch(/\/$/);
        });
      });

      it("all websites should have valid domain names", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          const url = new URL(protocol.website);
          expect(url.hostname.length).toBeGreaterThan(0);
          expect(url.hostname).toMatch(/^[a-z0-9.-]+$/);
        });
      });
    });

    describe("name format", () => {
      it("names should be properly capitalized", () => {
        Object.values(DEX_PROTOCOLS).forEach((protocol) => {
          const firstChar = protocol.name[0];
          expect(firstChar).toBe(firstChar.toUpperCase());
        });
      });

      it("should have no duplicate names across protocols", () => {
        const names = Object.values(DEX_PROTOCOLS).map((protocol) => protocol.name);
        const uniqueNames = new Set(names);
        expect(names.length).toBe(uniqueNames.size);
      });
    });
  });
});
