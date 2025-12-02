import { vi } from "vitest";
import type { PublicClient } from "viem";
import { ChainId, DexType, PriceResult, PoolTier } from "../../src/types";
import { MOCK_TOKENS } from "./fixtures";

export function createMockPublicClient(
  overrides: Partial<PublicClient> = {}
): PublicClient {
  return {
    readContract: vi.fn(),
    multicall: vi.fn(),
    simulateContract: vi.fn(),
    chain: { id: 1, name: "Ethereum" },
    ...overrides,
  } as unknown as PublicClient;
}

export function createMockPoolTier(overrides: Partial<PoolTier> = {}): PoolTier {
  return {
    type: "fee",
    value: 3000,
    display: "0.30% fee",
    ...overrides,
  };
}

export function createMockPriceResult(
  overrides: Partial<PriceResult> = {}
): PriceResult {
  return {
    tokenIn: MOCK_TOKENS.WETH,
    tokenOut: MOCK_TOKENS.USDC,
    amountIn: "1000000000000000000",
    amountOut: "2000000000",
    price: 2000,
    formatted: "1 WETH = 2000.00 USDC (0.30% fee)",
    poolTier: createMockPoolTier(),
    chainId: ChainId.ETHEREUM,
    gasEstimate: "100000",
    priceImpact: 0.01,
    ...overrides,
  };
}

export function createMockPriceResultWithDex(
  dexType: DexType = DexType.UNISWAP_V3,
  overrides: Partial<PriceResult> = {}
): PriceResult & { dexType: DexType } {
  return {
    ...createMockPriceResult(overrides),
    dexType,
  };
}
