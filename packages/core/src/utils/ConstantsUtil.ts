import type { Features } from './TypeUtil';

const defaultFeatures: Features = {
  swaps: true,
  onramp: true,
  email: true,
  emailShowWallets: true,
  socials: ['x', 'discord', 'apple']
};

export const OnRampErrorType = {
  AMOUNT_TOO_LOW: 'INVALID_AMOUNT_TOO_LOW',
  AMOUNT_TOO_HIGH: 'INVALID_AMOUNT_TOO_HIGH',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INCOMPATIBLE_REQUEST: 'INCOMPATIBLE_REQUEST',
  BAD_REQUEST: 'BAD_REQUEST',
  NO_VALID_QUOTES: 'NO_VALID_QUOTES',
  FAILED_TO_LOAD: 'FAILED_TO_LOAD',
  FAILED_TO_LOAD_COUNTRIES: 'FAILED_TO_LOAD_COUNTRIES',
  FAILED_TO_LOAD_PROVIDERS: 'FAILED_TO_LOAD_PROVIDERS',
  FAILED_TO_LOAD_METHODS: 'FAILED_TO_LOAD_METHODS',
  FAILED_TO_LOAD_CURRENCIES: 'FAILED_TO_LOAD_CURRENCIES',
  FAILED_TO_LOAD_LIMITS: 'FAILED_TO_LOAD_LIMITS',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const;

export const ConstantsUtil = {
  FOUR_MINUTES_MS: 240000,

  TEN_SEC_MS: 10000,

  ONE_SEC_MS: 1000,

  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,

  LINKING_ERROR: 'LINKING_ERROR',

  NATIVE_TOKEN_ADDRESS: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',

  ONRAMP_ERROR_TYPES: OnRampErrorType,

  SWAP_SUGGESTED_TOKENS: [
    'ETH',
    'UNI',
    '1INCH',
    'AAVE',
    'SOL',
    'ADA',
    'AVAX',
    'DOT',
    'LINK',
    'NITRO',
    'GAIA',
    'MILK',
    'TRX',
    'NEAR',
    'GNO',
    'WBTC',
    'DAI',
    'WETH',
    'USDC',
    'USDT',
    'ARB',
    'BAL',
    'BICO',
    'CRV',
    'ENS',
    'POL',
    'OP'
  ],

  SWAP_POPULAR_TOKENS: [
    'ETH',
    'UNI',
    '1INCH',
    'AAVE',
    'SOL',
    'ADA',
    'AVAX',
    'DOT',
    'LINK',
    'NITRO',
    'GAIA',
    'MILK',
    'TRX',
    'NEAR',
    'GNO',
    'WBTC',
    'DAI',
    'WETH',
    'USDC',
    'USDT',
    'ARB',
    'BAL',
    'BICO',
    'CRV',
    'ENS',
    'POL',
    'OP',
    'METAL',
    'DAI',
    'CHAMP',
    'WOLF',
    'SALE',
    'BAL',
    'BUSD',
    'MUST',
    'BTCpx',
    'ROUTE',
    'HEX',
    'WELT',
    'amDAI',
    'VSQ',
    'VISION',
    'AURUM',
    'pSP',
    'SNX',
    'VC',
    'LINK',
    'CHP',
    'amUSDT',
    'SPHERE',
    'FOX',
    'GIDDY',
    'GFC',
    'OMEN',
    'OX_OLD',
    'DE',
    'WNT'
  ],

  SWAP_SUPPORTED_NETWORKS: [
    // Ethereum'
    'eip155:1',
    // Arbitrum One'
    'eip155:42161',
    // Optimism'
    'eip155:10',
    // ZKSync Era'
    'eip155:324',
    // Base'
    'eip155:8453',
    // BNB Smart Chain'
    'eip155:56',
    // Polygon'
    'eip155:137',
    // Gnosis'
    'eip155:100',
    // Avalanche'
    'eip155:43114',
    // Fantom'
    'eip155:250',
    // Klaytn'
    'eip155:8217',
    // Aurora
    'eip155:1313161554'
  ],

  CONVERT_SLIPPAGE_TOLERANCE: 1,

  DEFAULT_FEATURES: defaultFeatures,

  NETWORK_DEFAULT_CURRENCIES: {
    'eip155:1': 'ETH', // Ethereum Mainnet
    'eip155:56': 'BNB', // Binance Smart Chain
    'eip155:137': 'POL', // Polygon
    'eip155:42161': 'ETH_ARBITRUM', // Arbitrum One
    'eip155:43114': 'AVAX', // Avalanche C-Chain
    'eip155:10': 'ETH_OPTIMISM', // Optimism
    'eip155:250': 'FTM', // Fantom
    'eip155:100': 'xDAI', // Gnosis Chain (formerly xDai)
    'eip155:8453': 'ETH_BASE', // Base
    'eip155:1284': 'GLMR', // Moonbeam
    'eip155:1285': 'MOVR', // Moonriver
    'eip155:25': 'CRO', // Cronos
    'eip155:42220': 'CELO', // Celo
    'eip155:8217': 'KLAY', // Klaytn
    'eip155:1313161554': 'AURORA_ETH', // Aurora
    'eip155:40': 'TLOS', // Telos EVM
    'eip155:1088': 'METIS', // Metis Andromeda
    'eip155:2222': 'KAVA', // Kava EVM
    'eip155:7777777': 'ZETA', // ZetaChain
    'eip155:7700': 'CANTO', // Canto
    'eip155:59144': 'ETH_LINEA', // Linea
    'eip155:1101': 'ETH_POLYGONZKEVM', // Polygon zkEVM
    'eip155:196': 'XIN' // Mixin
  }
};
