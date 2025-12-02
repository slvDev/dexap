import { describe, it, expect } from "vitest";
import {
  filterOutliers,
  calculateAggregatedPrice,
} from "../../src/utils/aggregation";
import { DexType, ChainId } from "../../src/types";
import { createMockPriceResultWithDex } from "../helpers/mocks";
import { MOCK_TOKENS } from "../helpers/fixtures";

describe("aggregation", () => {
  describe("filterOutliers", () => {
    describe("edge cases", () => {
      it("returns original quotes when less than 3 quotes provided", () => {
        [0, 1, 2].forEach((count) => {
          const quotes = Array.from({ length: count }, (_, i) =>
            createMockPriceResultWithDex(DexType.UNISWAP_V3, {
              price: 100 + i,
            })
          );
          const result = filterOutliers(quotes);
          expect(result).toHaveLength(count);
          expect(result).toEqual(quotes);
        });
      });

      it("filters extreme outlier from dataset", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1020 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1030 }),
          createMockPriceResultWithDex(DexType.AERODROME, { price: 1040 }),
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 10000 }),
        ];

        const result = filterOutliers(quotes);
        expect(result.length).toBe(5);
        expect(result.map((q) => q.price)).not.toContain(10000);
      });

      it("removes multiple outliers from dataset", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 100 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 150 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1010 }),
          createMockPriceResultWithDex(DexType.AERODROME, { price: 1020 }),
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1030 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1040 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 5000 }),
        ];

        const result = filterOutliers(quotes);
        expect(result.length).toBe(5);
        expect(result.map((q) => q.price)).not.toContain(100);
        expect(result.map((q) => q.price)).not.toContain(150);
        expect(result.map((q) => q.price)).not.toContain(5000);
      });

      it("handles identical prices without filtering", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1000 }),
        ];

        const result = filterOutliers(quotes);
        expect(result).toHaveLength(4);
        expect(result).toEqual(quotes);
      });

      it("handles minimal variance without filtering", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1005 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1008 }),
        ];

        const result = filterOutliers(quotes);
        expect(result).toHaveLength(4);
      });
    });

    describe("behavioral properties", () => {
      it("preserves all quote properties", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            amountIn: "1000000",
            amountOut: "1500000",
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1010,
            amountIn: "1000000",
            amountOut: "1510000",
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1020,
            amountIn: "1000000",
            amountOut: "1520000",
          }),
        ];

        const result = filterOutliers(quotes);

        result.forEach((quote) => {
          expect(quote).toHaveProperty("price");
          expect(quote).toHaveProperty("amountIn");
          expect(quote).toHaveProperty("amountOut");
          expect(quote).toHaveProperty("chainId");
          expect(quote).toHaveProperty("dexType");
        });
      });

      it("returns subset of original quotes without mutation", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1020 }),
        ];

        const result = filterOutliers(quotes);

        result.forEach((quote) => {
          expect(quotes).toContain(quote);
        });
      });

      it("does not mutate input array", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 10000 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1020 }),
        ];
        const originalLength = quotes.length;
        const firstQuote = quotes[0];

        filterOutliers(quotes);

        expect(quotes).toHaveLength(originalLength);
        expect(quotes[0]).toBe(firstQuote);
      });
    });
  });

  describe("calculateAggregatedPrice", () => {
    describe("valid cases", () => {
      it("handles single quote correctly", () => {
        const quote = createMockPriceResultWithDex(DexType.UNISWAP_V3, {
          price: 1000,
          amountOut: "1000000",
        });

        const result = calculateAggregatedPrice(
          [quote],
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.min).toBe(1000);
        expect(result.max).toBe(1000);
        expect(result.average).toBe(1000);
        expect(result.median).toBe(1000);
        expect(result.best).toEqual(quote);
        expect(result.all).toHaveLength(1);
      });

      it("handles two quotes with correct statistics", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            amountOut: "1000000",
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1200,
            amountOut: "1200000",
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.min).toBe(1000);
        expect(result.max).toBe(1200);
        expect(result.average).toBe(1100);
        expect(result.median).toBe(1100);
        expect(result.all).toHaveLength(2);
      });

      it("calculates correct median for odd number of quotes", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            amountOut: "1000000",
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1100,
            amountOut: "1100000",
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1200,
            amountOut: "1200000",
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.median).toBe(1100);
        expect(result.all).toHaveLength(3);
      });

      it("calculates correct median for even number of quotes", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1100 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1300 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1400 }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.median).toBe(1200); // (1100 + 1300) / 2
      });

      it("selects best quote by highest amountOut", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            amountIn: "1000000",
            amountOut: "1000000",
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1100,
            amountIn: "1000000",
            amountOut: "1500000",
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1200,
            amountIn: "1000000",
            amountOut: "1200000",
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.best.amountOut).toBe("1500000");
        expect(result.best.dexType).toBe(DexType.SUSHISWAP_V3);
      });

      it("includes all quotes when outlier filtering disabled", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1020 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 10000 }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.all).toHaveLength(4);
        expect(result.max).toBe(10000);
      });

      it("filters outliers when filtering enabled", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 1010 }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1020 }),
          createMockPriceResultWithDex(DexType.VELODROME, { price: 1030 }),
          createMockPriceResultWithDex(DexType.AERODROME, { price: 1040 }),
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 10000 }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          true
        );

        expect(result.all.length).toBe(5);
        expect(result.all.map((q) => q.price)).not.toContain(10000);
      });

      it("includes chainId from first quote", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            chainId: ChainId.ETHEREUM,
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1010,
            chainId: ChainId.BASE,
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.chainId).toBe(ChainId.ETHEREUM);
      });

      it("includes timestamp within reasonable range", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
        ];

        const beforeTimestamp = Date.now();
        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );
        const afterTimestamp = Date.now();

        expect(result.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
        expect(result.timestamp).toBeLessThanOrEqual(afterTimestamp);
      });
    });

    describe("invalid cases", () => {
      it("throws when no quotes provided", () => {
        expect(() =>
          calculateAggregatedPrice(
            [],
            MOCK_TOKENS.WETH,
            MOCK_TOKENS.USDC,
            false
          )
        ).toThrow("No price quotes to aggregate");
      });
    });

    describe("edge cases", () => {
      it("handles identical prices correctly", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000,
            amountOut: "1000000",
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1000,
            amountOut: "1100000",
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1000,
            amountOut: "900000",
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.min).toBe(1000);
        expect(result.max).toBe(1000);
        expect(result.average).toBe(1000);
        expect(result.median).toBe(1000);
        expect(result.best.amountOut).toBe("1100000");
      });

      it("handles large datasets", () => {
        const quotes = Array.from({ length: 20 }, (_, i) =>
          createMockPriceResultWithDex(
            [
              DexType.UNISWAP_V3,
              DexType.SUSHISWAP_V3,
              DexType.PANCAKESWAP_V3,
              DexType.VELODROME,
              DexType.AERODROME,
            ][i % 5],
            { price: 1000 + i * 10 }
          )
        );

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          true
        );

        expect(result.all.length).toBeGreaterThan(0);
        expect(result.all.length).toBeLessThanOrEqual(20);
      });

      it("handles fractional prices correctly", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000.123,
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1000.456,
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1000.789,
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.average).toBeCloseTo(1000.456, 2);
      });

      it("handles very large prices", () => {
        const quotes = [
          createMockPriceResultWithDex(DexType.UNISWAP_V3, {
            price: 1000000000,
          }),
          createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
            price: 1100000000,
          }),
          createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
            price: 1200000000,
          }),
        ];

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.min).toBe(1000000000);
        expect(result.max).toBe(1200000000);
        expect(result.average).toBe(1100000000);
      });
    });
  });

  describe("structural invariants", () => {
    it("average is always within [min, max] range", () => {
      const testCases = [
        [1000, 1500, 2000],
        [100, 200, 300, 400],
        [1000, 1000, 1000],
        [50, 100, 150, 200, 250],
      ];

      testCases.forEach((prices) => {
        const quotes = prices.map((price, i) =>
          createMockPriceResultWithDex(
            [
              DexType.UNISWAP_V3,
              DexType.SUSHISWAP_V3,
              DexType.PANCAKESWAP_V3,
              DexType.VELODROME,
              DexType.AERODROME,
            ][i % 5],
            { price }
          )
        );

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.average).toBeGreaterThanOrEqual(result.min);
        expect(result.average).toBeLessThanOrEqual(result.max);
      });
    });

    it("median is always within [min, max] range", () => {
      const testCases = [
        [1000, 1500, 2000],
        [100, 200, 300, 400],
        [50, 100, 150, 200, 250],
      ];

      testCases.forEach((prices) => {
        const quotes = prices.map((price, i) =>
          createMockPriceResultWithDex(
            [
              DexType.UNISWAP_V3,
              DexType.SUSHISWAP_V3,
              DexType.PANCAKESWAP_V3,
              DexType.VELODROME,
              DexType.AERODROME,
            ][i % 5],
            { price }
          )
        );

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.median).toBeGreaterThanOrEqual(result.min);
        expect(result.median).toBeLessThanOrEqual(result.max);
      });
    });

    it("best quote is always from result.all array", () => {
      const quotes = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, {
          price: 1000,
          amountOut: "1000000",
        }),
        createMockPriceResultWithDex(DexType.SUSHISWAP_V3, {
          price: 1100,
          amountOut: "1500000",
        }),
        createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, {
          price: 1200,
          amountOut: "1200000",
        }),
      ];

      const result = calculateAggregatedPrice(
        quotes,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        false
      );

      expect(result.all).toContain(result.best);
    });

    it("result.all array always has at least 1 quote", () => {
      const testCases = [
        [1000],
        [1000, 1500],
        [1000, 1500, 2000],
        [100, 200, 300, 400, 500],
      ];

      testCases.forEach((prices) => {
        const quotes = prices.map((price, i) =>
          createMockPriceResultWithDex(
            [
              DexType.UNISWAP_V3,
              DexType.SUSHISWAP_V3,
              DexType.PANCAKESWAP_V3,
              DexType.VELODROME,
              DexType.AERODROME,
            ][i % 5],
            { price }
          )
        );

        const result = calculateAggregatedPrice(
          quotes,
          MOCK_TOKENS.WETH,
          MOCK_TOKENS.USDC,
          false
        );

        expect(result.all.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("min and max match actual minimum and maximum prices", () => {
      const quotes = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 1000 }),
        createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 500 }),
        createMockPriceResultWithDex(DexType.PANCAKESWAP_V3, { price: 1500 }),
      ];

      const result = calculateAggregatedPrice(
        quotes,
        MOCK_TOKENS.WETH,
        MOCK_TOKENS.USDC,
        false
      );

      const allPrices = result.all.map((q) => q.price);
      expect(result.min).toBe(Math.min(...allPrices));
      expect(result.max).toBe(Math.max(...allPrices));
    });
  });
});
