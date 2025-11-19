import { ChainId, DexType } from "../types";
import { DexConfig, DexProtocol } from "./types";

export const DEX_PROTOCOLS: Record<DexType, DexProtocol> = {
  [DexType.UNISWAP_V3]: {
    type: DexType.UNISWAP_V3,
    name: "Uniswap",
    website: "https://uniswap.org",
  },
  [DexType.SUSHISWAP_V3]: {
    type: DexType.SUSHISWAP_V3,
    name: "SushiSwap",
    website: "https://sushi.com",
  },
  [DexType.PANCAKESWAP_V3]: {
    type: DexType.PANCAKESWAP_V3,
    name: "PancakeSwap",
    website: "https://pancakeswap.finance",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.ETHEREUM,
      quoterAddress: "0x64e8802FE490fa7cc61d3463958199161Bb608A7",
      factoryAddress: "0xbaceb8ec6b9355dfc0269c18bac9d6e2bdc29c4f",
      feeTiers: [100, 500, 3000, 10000],
    },
    [DexType.PANCAKESWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.PANCAKESWAP_V3],
      chainId: ChainId.ETHEREUM,
      quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
      factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.BSC,
      quoterAddress: "0xb1e835dc2785b52265711e17fccb0fd018226a6e",
      factoryAddress: "0x126555dd55a39328f69400d6ae4f782bd4c34abb",
      feeTiers: [100, 500, 3000, 10000],
    },
    [DexType.PANCAKESWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.PANCAKESWAP_V3],
      chainId: ChainId.BSC,
      quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
      factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.POLYGON,
      quoterAddress: "0xb1e835dc2785b52265711e17fccb0fd018226a6e",
      factoryAddress: "0x917933899c6a5f8e37f31e19f92cdbff7e8ff0e2",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.ARBITRUM,
      quoterAddress: "0x0524e833ccd057e4d7a296e3aaab9f7675964ce1",
      factoryAddress: "0x1af415a1eba07a4986a52b6f2e7de7003d82231e",
      feeTiers: [100, 500, 3000, 10000],
    },
    [DexType.PANCAKESWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.PANCAKESWAP_V3],
      chainId: ChainId.ARBITRUM,
      quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
      factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.OPTIMISM,
      quoterAddress: "0xb1e835dc2785b52265711e17fccb0fd018226a6e",
      factoryAddress: "0x9c6522117e2ed1fe5bdb72bb0ed5e3f2bde7dbe0",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.BASE,
      quoterAddress: "0xb1e835dc2785b52265711e17fccb0fd018226a6e",
      factoryAddress: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
      feeTiers: [100, 500, 3000, 10000],
    },
    [DexType.PANCAKESWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.PANCAKESWAP_V3],
      chainId: ChainId.BASE,
      quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
      factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
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
    [DexType.SUSHISWAP_V3]: {
      protocol: DEX_PROTOCOLS[DexType.SUSHISWAP_V3],
      chainId: ChainId.AVALANCHE,
      quoterAddress: "0xb1e835dc2785b52265711e17fccb0fd018226a6e",
      factoryAddress: "0x3e603c14af37ebdad31709c4f848fc6ad5bec715",
      feeTiers: [100, 500, 3000, 10000],
    },
  },
};
