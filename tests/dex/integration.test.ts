import { describe, it, expect, beforeAll } from "vitest";
import {
  getSupportedDexTypes,
  isDexSupported,
  createDexAdapter,
  getChainDexConfigs,
  getDexConfig,
} from "../../src/dex";
import { DEX_CONFIGS } from "../../src/dex/registry";
import { getChainConfig, getAllChainConfigs } from "../../src/chains";
import { getWrappedNativeToken, isTokenAvailable } from "../../src/tokens";
import { ChainId, DexType } from "../../src/types";

describe("dex integration", () => {
  let allChainIds: ChainId[];

  beforeAll(() => {
    allChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];
  });

  describe("DEX-Chain integration", () => {
    it("all chains in DEX_CONFIGS exist in CHAIN_CONFIGS", () => {
      const allChainConfigs = getAllChainConfigs();
      const validChainIds = allChainConfigs.map((config) => config.chainId);

      allChainIds.forEach((chainId) => {
        expect(validChainIds).toContain(chainId);
      });
    });

    it("ChainConfig.supportedDexes matches DEX_CONFIGS entries", () => {
      allChainIds.forEach((chainId) => {
        const chainConfig = getChainConfig(chainId);
        const dexConfigsForChain = getSupportedDexTypes(chainId);

        expect(chainConfig.supportedDexes.sort()).toEqual(dexConfigsForChain.sort());
      });
    });

    it("isDexSupported matches ChainConfig.supportedDexes", () => {
      allChainIds.forEach((chainId) => {
        const chainConfig = getChainConfig(chainId);

        chainConfig.supportedDexes.forEach((dexType) => {
          expect(isDexSupported(chainId, dexType)).toBe(true);
        });

        const allDexTypes = Object.values(DexType);
        const unsupportedDexes = allDexTypes.filter(
          (dexType) => !chainConfig.supportedDexes.includes(dexType)
        );

        unsupportedDexes.forEach((dexType) => {
          expect(isDexSupported(chainId, dexType)).toBe(false);
        });
      });
    });
  });

  describe("DEX-Token integration", () => {
    it("all DEX-enabled chains have wrapped native token", () => {
      allChainIds.forEach((chainId) => {
        const wrapped = getWrappedNativeToken(chainId);
        expect(wrapped).toBeDefined();
        expect(wrapped?.symbol).toBeTruthy();
      });
    });

    it("wrapped native token is available on DEX chains", () => {
      allChainIds.forEach((chainId) => {
        const wrapped = getWrappedNativeToken(chainId);
        if (wrapped) {
          expect(isTokenAvailable(wrapped.symbol, chainId)).toBe(true);
        }
      });
    });

    it("at least some common trading tokens available on DEX chains", () => {
      const commonTokens = ["USDC", "USDT", "WETH", "WBTC"];
      let totalAvailableCount = 0;

      allChainIds.forEach((chainId) => {
        commonTokens.forEach((symbol) => {
          if (isTokenAvailable(symbol, chainId)) {
            totalAvailableCount++;
          }
        });
      });

      expect(totalAvailableCount).toBeGreaterThan(0);
    });
  });

  describe("adapter creation across chains", () => {
    it("createDexAdapter works for all chain-dex combinations", () => {
      allChainIds.forEach((chainId) => {
        const supportedDexes = getSupportedDexTypes(chainId);
        supportedDexes.forEach((dexType) => {
          const adapter = createDexAdapter(chainId, dexType);
          expect(adapter).toBeDefined();
          expect(adapter.config.chainId).toBe(chainId);
        });
      });
    });

    it("adapters have valid quoterAddress from config", () => {
      allChainIds.forEach((chainId) => {
        const configs = getChainDexConfigs(chainId);
        configs.forEach((config) => {
          const adapter = createDexAdapter(chainId, config.protocol.type);
          expect(adapter.config.quoterAddress).toBe(config.quoterAddress);
          expect(adapter.config.quoterAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
        });
      });
    });

    it("same DexType on different chains uses correct addresses", () => {
      const dexType = DexType.UNISWAP_V3;
      const chainsWithUniswap = allChainIds.filter((chainId) =>
        isDexSupported(chainId, dexType)
      );

      const addressesPerChain = chainsWithUniswap.map((chainId) => {
        const adapter = createDexAdapter(chainId, dexType);
        return adapter.config.quoterAddress;
      });

      const uniqueAddresses = new Set(addressesPerChain);
      expect(uniqueAddresses.size).toBeGreaterThan(1);
    });
  });

  describe("cross-module error handling", () => {
    it("getDexConfig errors are informative", () => {
      const chainId = ChainId.ETHEREUM;
      const unsupportedDex = DexType.VELODROME;

      expect(() => getDexConfig(chainId, unsupportedDex)).toThrow(
        /DEX .* not configured for chain/
      );
    });
  });

  describe("type enum coverage", () => {
    it("all DexType enum values used in at least one chain", () => {
      const allDexTypes = Object.values(DexType);
      const usedDexTypes = new Set<DexType>();

      allChainIds.forEach((chainId) => {
        const supportedTypes = getSupportedDexTypes(chainId);
        supportedTypes.forEach((dexType) => usedDexTypes.add(dexType));
      });

      allDexTypes.forEach((dexType) => {
        expect(usedDexTypes.has(dexType)).toBe(true);
      });
    });

    it("all ChainConfig.supportedDexes reference valid DexTypes", () => {
      const validDexTypes = Object.values(DexType);

      allChainIds.forEach((chainId) => {
        const chainConfig = getChainConfig(chainId);
        chainConfig.supportedDexes.forEach((dexType) => {
          expect(validDexTypes).toContain(dexType);
        });
      });
    });
  });
});
