# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-12-02

### Added

- **Multi-chain DEX price aggregation** - Core functionality for fetching and aggregating token prices across decentralized exchanges

- **11 EVM Chain Support**
  - Ethereum Mainnet
  - BNB Smart Chain (BSC)
  - Polygon
  - Arbitrum One
  - Avalanche C-Chain
  - Optimism
  - Base
  - Zora
  - Unichain
  - World Chain
  - Soneium

- **DEX Protocol Support**
  - UniswapV3 protocol: Uniswap V3, SushiSwap V3, PancakeSwap V3 (fee-based tiers)
  - Slipstream protocol: Velodrome (Optimism), Aerodrome (Base) (tick spacing-based tiers)

- **RPC Provider Integration**
  - Alchemy provider support
  - Infura provider support
  - Custom RPC URL support
  - Automatic URL construction from API keys

- **Price Aggregation Features**
  - Multi-pool price fetching
  - Outlier filtering using IQR (Interquartile Range) method
  - Configurable aggregation strategies
  - Support for multiple fee tiers

- **Developer Experience**
  - Full TypeScript support with comprehensive type definitions
  - Dual ESM/CommonJS build output
  - Peer dependency on viem for Web3 interactions
  - Extensive JSDoc documentation

- **Quality Assurance**
  - Comprehensive test suite with 143 tests
  - 89% code coverage
  - Unit tests for all core modules

[Unreleased]: https://github.com/slvDev/dexap/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/slvDev/dexap/releases/tag/v0.1.0
