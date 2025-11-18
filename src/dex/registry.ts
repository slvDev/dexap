import { ChainId, DexType } from "../types";
import { DexConfig, DexProtocol } from "./types";

export const DEX_PROTOCOLS: Record<DexType, DexProtocol> = {
  [DexType.UNISWAP_V3]: {
    type: DexType.UNISWAP_V3,
    name: "Uniswap",
    website: "https://uniswap.org",
  },
};

export const DEX_CONFIGS: Record<
  ChainId,
  Partial<Record<DexType, DexConfig>>
> = {
  [ChainId.ETHEREUM]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.ETHEREUM,
      quoterAddress: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.BSC]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.BSC,
      quoterAddress: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
      factoryAddress: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.POLYGON]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.POLYGON,
      quoterAddress: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.ARBITRUM]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.ARBITRUM,
      quoterAddress: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.OPTIMISM]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.OPTIMISM,
      quoterAddress: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.BASE]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.BASE,
      quoterAddress: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
      factoryAddress: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
  [ChainId.AVALANCHE]: {
    [DexType.UNISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.UNISWAP_V3],
      chainId: ChainId.AVALANCHE,
      quoterAddress: "0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F",
      factoryAddress: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
};
