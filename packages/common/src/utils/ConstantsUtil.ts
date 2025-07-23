export const ConstantsUtil = {
  VERSION: '2.0.0-alpha.1',

  EIP155: 'eip155',
  ADD_CHAIN_METHOD: 'wallet_addEthereumChain',

  WC_NAME_SUFFIX: '.reown.id',
  WC_NAME_SUFFIX_LEGACY: '.wcn.id',

  BLOCKCHAIN_API_RPC_URL: 'https://rpc.walletconnect.org',
  BLOCKCHAIN_API_RPC_URL_STAGING: 'https://staging.rpc.walletconnect.org',
  PULSE_API_URL: 'https://pulse.walletconnect.org',
  API_URL: 'https://api.web3modal.org',
  WEB_WALLET_URL: 'https://web-wallet.walletconnect.org',
  SECURE_SITE_DASHBOARD: `https://secure.reown.com/dashboard`,
  SECURE_SITE_ICON: `https://secure.reown.com/images/favicon.png`,

  //TODO: remove this
  WALLET_CONNECT_CONNECTOR_ID: 'walletConnect',
  COINBASE_CONNECTOR_ID: 'coinbaseWallet',

  COINBASE_EXPLORER_ID: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
  PHANTOM_EXPLORER_ID: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',

  USDT_CONTRACT_ADDRESSES: [
    // Mainnet
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // Polygon
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    // Avalanche
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    // Cosmos
    '0x919C1c267BC06a7039e03fcc2eF738525769109c',
    // Celo
    '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    // Binance
    '0x55d398326f99059fF775485246999027B3197955',
    // Arbitrum
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
  ],

  PHANTOM_CUSTOM_WALLET: {
    id: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    name: 'Phantom Wallet',
    image_id: 'b6ec7b81-bb4f-427d-e290-7631e6e50d00',
    mobile_link: 'phantom://'
  },

  // Storage Keys
  STORAGE_KEYS: {
    WC_DEEPLINK: 'WALLETCONNECT_DEEPLINK_CHOICE', //dont change this one
    RECENT_WALLET: '@appkit/recent_wallet',
    CONNECTED_WALLET_IMAGE_URL: '@appkit/connected_wallet_image_url',
    CONNECTED_CONNECTORS: '@appkit/connected_connectors',
    CONNECTED_SOCIAL: '@appkit/connected_social',
    ONRAMP_PREFERRED_COUNTRY: '@appkit/onramp_preferred_country',
    ONRAMP_COUNTRIES: '@appkit/onramp_countries',
    ONRAMP_SERVICE_PROVIDERS: '@appkit/onramp_service_providers',
    ONRAMP_FIAT_LIMITS: '@appkit/onramp_fiat_limits',
    ONRAMP_FIAT_CURRENCIES: '@appkit/onramp_fiat_currencies',
    ONRAMP_PREFERRED_FIAT_CURRENCY: '@appkit/onramp_preferred_fiat_currency',
    ACTIVE_NAMESPACE: '@appkit/active_namespace',
    COINBASE_CONNECTOR_SESSION: '@appkit/coinbase_connector/session'
  }
};
