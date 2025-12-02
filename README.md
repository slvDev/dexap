<div align="center">

# dexap

### Query any DEX, any chain, one simple API

**Decentralized price queries from DEXes across multiple chains**

[Installation](#-installation) |
[Quick Start](#-quick-start) |
[Core Concepts](#-core-concepts) |
[API Reference](#-api-reference) |
[Usage Guides](#-usage-guides)

---

</div>

## Why dexap?

Finding the best price across multiple DEXes and chains is complex. Different protocols, different APIs, different pool structures. **dexap** abstracts all of this complexity into a clean, type-safe interface.

- **Truly Decentralized** - Query prices directly from onchain liquidity pools instead of relying on centralized price oracles. Keep your Web3 stack decentralized end-to-end.
- **One API, Many DEXes** - Query UniswapV3-based DEXes (Uniswap, SushiSwap, PancakeSwap) and Slipstream DEXes (Velodrome, Aerodrome) with identical syntax
- **11 Chains Supported** - Ethereum, Base, Optimism, Arbitrum, Polygon, BSC, Avalanche, and more
- **Best Price Discovery** - Automatically find the optimal DEX for your trade
- **Price Aggregation** - Get average, median, min/max prices with outlier filtering
- **TypeScript First** - Full type definitions with IntelliSense support
- **Minimal Dependencies** - Only requires `viem` as a peer dependency
- **Symbol Resolution** - Use token symbols directly, no need to look up addresses

---

## Installation

```bash
# npm
npm install dexap viem

# yarn
yarn add dexap viem

# pnpm
pnpm add dexap viem
```

> **Note:** `viem` is a peer dependency and must be installed alongside dexap.

---

## Quick Start

```typescript
import { createClient, ChainId, DexType } from "dexap";

const client = createClient({
  alchemyKey: "your-api-key", // Optional
});

// Get a price quote
const result = await client.getPrice(
  "WETH",
  "USDC",
  "1",
  ChainId.ETHEREUM,
  DexType.UNISWAP_V3
);

console.log(result.formatted); // "1 WETH = 3,245.67 USDC"
```

See [Usage Guides](#-usage-guides) for more examples.

---

## Core Concepts

### Understanding DEX Protocols

dexap supports two types of concentrated liquidity protocols with different pool configurations:

#### UniswapV3 Protocol

**Used by:** Uniswap V3, SushiSwap V3, PancakeSwap V3

**Pool Tiers:** Based on **fee percentages**

- `100` = 0.01% fee (stablecoin pairs like USDC/USDT)
- `500` = 0.05% fee (correlated pairs like ETH/WETH)
- `3000` = 0.30% fee (standard pairs like ETH/USDC)
- `10000` = 1.00% fee (volatile/exotic pairs)

**Available on:** All 11 chains

#### Slipstream Protocol

**Used by:** Velodrome (Optimism), Aerodrome (Base)

**Pool Tiers:** Based on **tick spacing**

- `1` = Tightest spacing (stablecoin pairs)
- `50` = Tight spacing (correlated assets)
- `100` = Standard spacing (common pairs)
- `200` = Wide spacing (volatile pairs)
- `2000` = Widest spacing (exotic pairs)

**Key Difference:** Slipstream is Velodrome's concentrated liquidity implementation optimized for OP Stack chains. It's NOT a UniswapV3 fork - it uses tick spacing parameters instead of fee tiers for pool configuration.

**Available on:** Optimism (Velodrome), Base (Aerodrome)

> **Important:** dexap abstracts these protocol differences completely. You use the same API methods regardless of whether you're querying UniswapV3 or Slipstream pools. The `poolTier` in results will show the appropriate tier type for each protocol.

---

### Chain & DEX Availability

dexap automatically handles protocol selection based on your query method:

**Best Price Mode** (`getBestPrice`)

- Queries all available DEXes on the specified chain
- Returns the best price with DEX identifier
- Optimal for finding the most favorable rate

**Specific DEX Mode** (`getPrice`)

- Queries a single specified DEX
- Use when you need prices from a particular protocol
- Faster than querying all DEXes

**Aggregation Mode** (`getAggregatedPrice`)

- Queries all DEXes and provides statistical analysis
- Returns average, median, min, max prices
- Includes outlier filtering (IQR method)
- Best for market overview and price discovery

**Check availability:** Use `getSupportedDexTypes(chainId)` to find which DEXes are available on a specific chain.

---

### Token Symbol Resolution

dexap includes a built-in token registry that simplifies token handling:

- **Automatic resolution** - Use symbols like `"WETH"`, `"USDC"` instead of addresses
- **Multi-chain support** - Same symbol works across all supported chains
- **Decimal handling** - Automatically handles tokens with different decimals per chain
- **Common tokens** - WETH, WBTC, USDC, USDT, DAI, and more pre-configured

---

## API Reference

### Client Creation

#### `createClient(config?)`

Creates a dexap client instance for querying DEX prices.

**Parameters:**

```typescript
interface ClientConfig {
  alchemyKey?: string; // Alchemy API key
  infuraKey?: string; // Infura API key
  rpcUrls?: Partial<Record<ChainKey, string>>; // Custom RPC URLs
}
```

**Returns:** `Client` instance

**Example:**

```typescript
const client = createClient({
  alchemyKey: "your-key",
});
```

---

### Price Query Methods

#### `client.getPrice(tokenIn, tokenOut, amount, chainId, dexType)`

Get a price quote from a specific DEX.

**Parameters:**

| Parameter  | Type                  | Description                                   |
| ---------- | --------------------- | --------------------------------------------- |
| `tokenIn`  | `string \| TokenInfo` | Input token symbol or address                 |
| `tokenOut` | `string \| TokenInfo` | Output token symbol or address                |
| `amount`   | `string`              | Amount in human-readable format (e.g., "1.5") |
| `chainId`  | `ChainId`             | Target blockchain                             |
| `dexType`  | `DexType`             | Specific DEX to query                         |

**Returns:** `Promise<PriceResult>`

---

#### `client.getBestPrice(tokenIn, tokenOut, amount, chainId)`

Find the best price across all available DEXes on a chain.

**Parameters:** Same as `getPrice` except no `dexType` parameter

**Returns:** `Promise<PriceResult & { dexType: DexType }>`

The result includes a `dexType` field indicating which DEX provided the best price.

---

#### `client.getPricesFromAllDexes(tokenIn, tokenOut, amount, chainId)`

Get price quotes from all available DEXes on a chain.

**Parameters:** Same as `getPrice` except no `dexType` parameter

**Returns:** `Promise<Array<PriceResult & { dexType: DexType }>>`

Returns an array of price results, one for each available DEX.

---

#### `client.getAggregatedPrice(tokenIn, tokenOut, amount, chainId, filterOutliers?)`

Get aggregated price statistics across all DEXes with optional outlier filtering.

**Parameters:**

| Parameter        | Type                  | Default | Description                 |
| ---------------- | --------------------- | ------- | --------------------------- |
| `tokenIn`        | `string \| TokenInfo` | -       | Input token                 |
| `tokenOut`       | `string \| TokenInfo` | -       | Output token                |
| `amount`         | `string`              | -       | Amount to query             |
| `chainId`        | `ChainId`             | -       | Target chain                |
| `filterOutliers` | `boolean`             | `true`  | Apply IQR outlier filtering |

**Returns:** `Promise<AggregatedPrice>`

---

### Token Utilities

Utility functions for working with tokens across chains.

#### `resolveToken(symbol, chainId)`

Resolve a token symbol to chain-specific address and decimals.

```typescript
function resolveToken(symbol: string, chainId: ChainId): TokenInfo;
```

---

#### `getTokenMetadata(symbol)`

Get token metadata without specifying a chain.

```typescript
function getTokenMetadata(symbol: string): TokenMetadata | undefined;
```

Returns name, symbol, and decimals (chain-agnostic).

---

#### `getSupportedChains(symbol)`

Find which chains support a specific token.

```typescript
function getSupportedChains(symbol: string): ChainId[];
```

---

#### `getChainTokens(chainId)`

Get all tokens available on a specific chain.

```typescript
function getChainTokens(chainId: ChainId): TokenInfo[];
```

---

#### `getWrappedNativeToken(chainId)`

Get the wrapped native token for a chain (WETH, WBNB, WMATIC, etc.).

```typescript
function getWrappedNativeToken(chainId: ChainId): TokenInfo | undefined;
```

---

### DEX Utilities

Utility functions for discovering and checking DEX availability.

#### `getSupportedDexTypes(chainId)`

Get all DEX types available on a specific chain.

```typescript
function getSupportedDexTypes(chainId: ChainId): DexType[];

// Example
const baseDexes = getSupportedDexTypes(ChainId.BASE);
// => [DexType.UNISWAP_V3, DexType.SUSHISWAP_V3,
//     DexType.PANCAKESWAP_V3, DexType.AERODROME]
```

---

#### `getDexProtocol(dexType)`

Get protocol metadata for a DEX type.

```typescript
function getDexProtocol(dexType: DexType): DexProtocol;

// Example
const protocol = getDexProtocol(DexType.VELODROME);
// => { type: "velodrome", name: "Velodrome", website: "https://velodrome.finance" }
```

---

#### `isDexSupported(chainId, dexType)`

Check if a specific DEX is available on a chain.

```typescript
function isDexSupported(chainId: ChainId, dexType: DexType): boolean;

// Example
const supported = isDexSupported(ChainId.BASE, DexType.VELODROME);
// => false (Velodrome is only on Optimism)
```

---

### Types

#### `PriceResult`

The result of a price query.

```typescript
interface PriceResult {
  tokenIn: TokenInfo; // Input token details
  tokenOut: TokenInfo; // Output token details
  amountIn: string; // Input amount in wei
  amountOut: string; // Output amount in wei
  price: number; // Numeric price (tokenOut per tokenIn)
  formatted: string; // Human-readable: "1 WETH = 3,245.67 USDC"
  poolTier: PoolTier; // Pool tier information
  chainId: ChainId; // Chain identifier
  gasEstimate: string; // Estimated gas in wei
  priceImpact: number; // Price impact percentage
}
```

---

#### `AggregatedPrice`

Aggregated price statistics across multiple DEXes.

```typescript
interface AggregatedPrice {
  average: number; // Average price
  median: number; // Median price
  min: number; // Minimum price
  max: number; // Maximum price
  best: PriceResult & { dexType: DexType }; // Best price with DEX
  all: Array<PriceResult & { dexType: DexType }>; // All prices
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  chainId: ChainId;
  timestamp: number; // Query timestamp
}
```

---

#### `PoolTier`

Pool tier information (fee or tick spacing).

```typescript
interface PoolTier {
  type: "fee" | "tickSpacing"; // Tier type
  value: number; // Fee (e.g., 3000) or tick spacing (e.g., 100)
  display: string; // Human-readable: "0.30% fee" or "100 tick spacing"
}
```

---

#### `TokenInfo`

Token information including address and decimals.

```typescript
interface TokenInfo {
  symbol: string; // Token symbol (e.g., "WETH")
  address: `0x${string}`; // Contract address
  decimals: number; // Token decimals
}
```

---

#### Enums

```typescript
enum ChainId {
  ETHEREUM = 1,
  BSC = 56,
  POLYGON = 137,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  OPTIMISM = 10,
  BASE = 8453,
  ZORA = 7777777,
  UNICHAIN = 130,
  WORLD_CHAIN = 480,
  SONEIUM = 1868,
}

enum DexType {
  UNISWAP_V3 = "uniswap-v3",
  SUSHISWAP_V3 = "sushiswap-v3",
  PANCAKESWAP_V3 = "pancakeswap-v3",
  VELODROME = "velodrome",
  AERODROME = "aerodrome",
}
```

---

## Usage Guides

### Getting Started

**Scenario:** Check the current WETH/USDC price on Ethereum.

```typescript
import { createClient, ChainId, DexType } from "dexap";

const client = createClient({
  alchemyKey: "your-api-key",
});

const result = await client.getPrice(
  "WETH",
  "USDC",
  "1",
  ChainId.ETHEREUM,
  DexType.UNISWAP_V3
);

console.log(result.formatted); // "1 WETH = 3,245.67 USDC"
console.log(result.poolTier.display); // "0.30% fee"
console.log(result.price); // 3245.67
console.log(result.priceImpact); // 0.0234
console.log(result.gasEstimate); // "150000"
```

---

### Multi-DEX Comparison

**Scenario:** Find which DEX offers the best WETH price on Ethereum.

```typescript
import { createClient, ChainId } from "dexap";

const client = createClient({ alchemyKey: "your-api-key" });

// Option 1: Get best price directly
const best = await client.getBestPrice("WETH", "USDC", "1", ChainId.ETHEREUM);

console.log(`Best: ${best.formatted}`);
console.log(`DEX: ${best.dexType}`);
console.log(`Pool: ${best.poolTier.display}`);

// Option 2: Compare all DEXes manually
const allPrices = await client.getPricesFromAllDexes(
  "WETH",
  "USDC",
  "1",
  ChainId.ETHEREUM
);

allPrices.forEach((quote) => {
  console.log(
    `${quote.dexType}: ${quote.formatted} (impact: ${quote.priceImpact.toFixed(
      4
    )}%)`
  );
});
```

---

### Multi-Chain Operations

**Scenario:** Check WETH/USDC price across multiple chains.

```typescript
import { createClient, ChainId, DexType } from "dexap";

const client = createClient({ alchemyKey: "your-api-key" });

const chains = [
  ChainId.ETHEREUM,
  ChainId.BASE,
  ChainId.ARBITRUM,
  ChainId.OPTIMISM,
  ChainId.POLYGON,
];

const prices = await Promise.allSettled(
  chains.map((chainId) =>
    client.getPrice("WETH", "USDC", "1", chainId, DexType.UNISWAP_V3)
  )
);

prices.forEach((result, i) => {
  if (result.status === "fulfilled") {
    const chainName = ChainId[chains[i]];
    console.log(`${chainName}: $${result.value.price.toFixed(2)}`);
  } else {
    console.log(`${ChainId[chains[i]]}: Error - ${result.reason}`);
  }
});
```

---

### Price Aggregation

**Scenario:** Get statistical analysis of WETH price across all DEXes on Base.

```typescript
import { createClient, ChainId } from "dexap";

const client = createClient({ alchemyKey: "your-api-key" });

const agg = await client.getAggregatedPrice(
  "WETH",
  "USDC",
  "1",
  ChainId.BASE,
  true // Filter outliers
);

console.log(`Average: $${agg.average.toFixed(2)}`);
console.log(`Median:  $${agg.median.toFixed(2)}`);
console.log(`Range:   $${agg.min.toFixed(2)} - $${agg.max.toFixed(2)}`);
console.log(`Best:    ${agg.best.formatted} (${agg.best.dexType})`);
console.log(`Spread:  ${(((agg.max - agg.min) / agg.min) * 100).toFixed(2)}%`);

// Analyze individual DEX prices
agg.all.forEach((quote) => {
  const spread = ((quote.price - agg.min) / agg.min) * 100;
  console.log(
    `${quote.dexType}: $${quote.price.toFixed(2)} (+${spread.toFixed(
      2
    )}% above min)`
  );
});
```

---

### Working with Tokens

**Scenario:** Discover token availability and resolve addresses.

```typescript
import {
  resolveToken,
  getTokenMetadata,
  getSupportedChains,
  getChainTokens,
  getWrappedNativeToken,
  ChainId,
} from "dexap";

// Get token metadata (chain-agnostic)
const meta = getTokenMetadata("WETH");
console.log(`${meta.name} - ${meta.decimals} decimals`);

// Find which chains support USDC
const usdcChains = getSupportedChains("USDC");
console.log(`USDC available on ${usdcChains.length} chains`);

// Get token address for specific chain
const weth = resolveToken("WETH", ChainId.BASE);
console.log(`WETH on Base: ${weth.address}`);

// Get wrapped native token
const wrapped = getWrappedNativeToken(ChainId.BSC);
console.log(`BSC wrapped native: ${wrapped.symbol}`); // "WBNB"

// List all tokens on a chain
const baseTokens = getChainTokens(ChainId.BASE);
console.log(`Tokens on Base: ${baseTokens.map((t) => t.symbol).join(", ")}`);
```

---

### Configuration

**Scenario:** Configure RPC providers for optimal performance.

```typescript
import { createClient } from "dexap";

// Use Alchemy
const alchemyClient = createClient({
  alchemyKey: "your-alchemy-key",
});

// Use Infura
const infuraClient = createClient({
  infuraKey: "your-infura-key",
});

// Mix custom RPCs with API keys
const customClient = createClient({
  alchemyKey: "your-key", // Use Alchemy for most chains
  rpcUrls: {
    mainnet: "https://your-private-eth-rpc.com", // Override Ethereum
    base: "https://your-private-base-rpc.com", // Override Base
  },
});

// Public RPCs only (rate limited, not recommended for production)
const publicClient = createClient();
```

---

### Error Handling

**Scenario:** Handle common errors gracefully.

```typescript
import { createClient, ChainId, DexType } from "dexap";

const client = createClient({ alchemyKey: "your-api-key" });

try {
  const result = await client.getPrice(
    "WETH",
    "USDC",
    "1",
    ChainId.ETHEREUM,
    DexType.UNISWAP_V3
  );
  console.log("Price:", result.formatted);
} catch (error) {
  if (error instanceof Error) {
    if (
      error.message.includes("Token") &&
      error.message.includes("not found")
    ) {
      console.log("Token not supported on this chain");
    } else if (error.message.includes("not configured")) {
      console.log("DEX not available on this chain");
    } else if (error.message.includes("No liquidity found")) {
      console.log("No liquidity available for this pair");
    } else {
      console.error("Unexpected error:", error.message);
    }
  }
}
```

**Common error patterns:**

- `Token "${symbol}" not found on chain ${chainId}` - Token not deployed on this chain
- `DEX ${dexType} not configured for chain ${chainId}` - DEX not available on this chain
- `No liquidity found for ${tokenIn}/${tokenOut} on ${dexType}` - Insufficient liquidity

---

## Supported Chains

| Chain           | Chain ID  | DEXes Available                                  |
| --------------- | --------- | ------------------------------------------------ |
| Ethereum        | `1`       | UniswapV3, SushiSwapV3, PancakeSwapV3            |
| Base            | `8453`    | UniswapV3, SushiSwapV3, PancakeSwapV3, Aerodrome |
| Optimism        | `10`      | UniswapV3, SushiSwapV3, Velodrome                |
| Arbitrum        | `42161`   | UniswapV3, SushiSwapV3, PancakeSwapV3            |
| Polygon         | `137`     | UniswapV3, SushiSwapV3                           |
| BNB Smart Chain | `56`      | UniswapV3, SushiSwapV3, PancakeSwapV3            |
| Avalanche       | `43114`   | UniswapV3, SushiSwapV3                           |
| Zora            | `7777777` | UniswapV3                                        |
| Unichain        | `130`     | UniswapV3                                        |
| World Chain     | `480`     | UniswapV3                                        |
| Soneium         | `1868`    | UniswapV3                                        |

---

## Supported DEXes

| DEX                | Protocol   | Pool Tiers                | Chains                                                      |
| ------------------ | ---------- | ------------------------- | ----------------------------------------------------------- |
| **Uniswap V3**     | UniswapV3  | Fee-based (0.01% - 1.00%) | All 11 chains                                               |
| **SushiSwap V3**   | UniswapV3  | Fee-based (0.01% - 1.00%) | Ethereum, Base, Optimism, Arbitrum, Polygon, BSC, Avalanche |
| **PancakeSwap V3** | UniswapV3  | Fee-based (0.01% - 1.00%) | Ethereum, Base, Arbitrum, BSC                               |
| **Velodrome**      | Slipstream | Tick Spacing (1 - 2000)   | Optimism                                                    |
| **Aerodrome**      | Slipstream | Tick Spacing (1 - 2000)   | Base                                                        |

---

## License

[MIT](./LICENSE)
