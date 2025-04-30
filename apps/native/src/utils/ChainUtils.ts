import { CaipNetworkId, ChainNamespace } from '@reown/appkit-common-react-native';

export const solana = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  network: 'solana-mainnet',
  nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
  rpcUrls: {
    default: { http: ['https://api.mainnet-beta.solana.com'] }
  },
  blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
  testnet: false,
  chainNamespace: 'solana' as ChainNamespace,
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as CaipNetworkId,
  deprecatedCaipNetworkId: 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ' as CaipNetworkId
};
