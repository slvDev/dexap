import { AggregatedPrice, DexType, PriceResult, TokenInfo } from "../types";

export function calculateAggregatedPrice(
  quotes: Array<PriceResult & { dexType: DexType }>,
  tokenIn: TokenInfo,
  tokenOut: TokenInfo,
  filterOutliersEnabled: boolean = true
): AggregatedPrice {
  if (quotes.length === 0) {
    throw new Error("No price quotes to aggregate");
  }

  let filteredQuotes = quotes;
  if (filterOutliersEnabled) {
    if (quotes.length < 3) {
      console.warn(
        `Outlier filtering requires at least 3 DEX quotes. Currently using ${quotes.length} DEX(es). Filtering disabled.`
      );
    } else if (quotes.length === 3) {
      console.warn(
        `Outlier filtering with only 3 DEX quotes is unreliable. Consider adding more DEXes for better accuracy.`
      );
      filteredQuotes = filterOutliers(quotes);
    } else {
      filteredQuotes = filterOutliers(quotes);
    }
  }

  if (filteredQuotes.length === 0) {
    throw new Error("All quotes were filtered as outliers");
  }

  // Calculate statistics
  const prices = filteredQuotes.map((q) => q.price);
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;

  const sortedPrices = [...prices].sort((a, b) => a - b);
  const midIndex = Math.floor(sortedPrices.length / 2);
  const isOddLength = sortedPrices.length % 2 === 1;

  const median = isOddLength
    ? sortedPrices[midIndex]
    : (sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2;

  const best = filteredQuotes.reduce((best, current) =>
    BigInt(current.amountOut) > BigInt(best.amountOut) ? current : best
  );

  return {
    average,
    median,
    min: Math.min(...prices),
    max: Math.max(...prices),
    best,
    all: filteredQuotes,
    tokenIn,
    tokenOut,
    chainId: quotes[0].chainId,
    timestamp: Date.now(),
  };
}

export function filterOutliers(
  quotes: Array<PriceResult & { dexType: DexType }>
): Array<PriceResult & { dexType: DexType }> {
  if (quotes.length < 3) {
    return quotes;
  }

  const prices = quotes.map((q) => q.price);
  const sorted = [...prices].sort((a, b) => a - b);

  // Calculate Q1 and Q3
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index]!;
  const q3 = sorted[q3Index]!;
  const iqr = q3 - q1;

  // Outliers are beyond 1.5 * IQR from quartiles
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  // Filter quotes within bounds
  return quotes.filter((quote) => {
    const price = quote.price;
    return price >= lowerBound && price <= upperBound;
  });
}
