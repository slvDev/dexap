import { describe, it, expect } from "vitest";
import { filterOutliers } from "../../src/utils/aggregation";
import { DexType } from "../../src/types";
import { createMockPriceResultWithDex } from "../helpers/mocks";

describe("aggregation", () => {
  describe("filterOutliers", () => {
    it("should return all quotes when less than 3 quotes provided", () => {
      const quotes = [
        createMockPriceResultWithDex(DexType.UNISWAP_V3, { price: 100 }),
        createMockPriceResultWithDex(DexType.SUSHISWAP_V3, { price: 101 }),
      ];

      const result = filterOutliers(quotes);

      expect(result).toHaveLength(2);
    });
  });
});
