import type {
  CaipAddress,
  Namespaces,
  ProposalNamespaces
} from '@reown/appkit-common-react-native';

export const COINBASE_METHODS = {
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  SIGN_TRANSACTION: 'eth_signTransaction',
  SEND_TRANSACTION: 'eth_sendTransaction',
  SIGN_MESSAGE: 'personal_sign',
  SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',
  WATCH_ASSET: 'wallet_watchAsset'
} as const;

export function getCoinbaseNamespace(
  namespaces?: ProposalNamespaces,
  accounts?: string[]
): Namespaces {
  if (!namespaces || !accounts) {
    throw new Error('CoinbaseConnector: Namespaces or accounts not found');
  }

  const namespace = namespaces['eip155'];

  if (!namespace) {
    throw new Error('CoinbaseConnector: Namespace not found');
  }

  let caipAddresses: CaipAddress[] = [];

  for (const account of accounts) {
    namespace.chains?.forEach(chain => {
      caipAddresses.push(`${chain}:${account}`);
    });
  }

  return {
    ['eip155']: {
      ...namespace,
      methods: Object.values(COINBASE_METHODS),
      accounts: caipAddresses
    }
  };
}
