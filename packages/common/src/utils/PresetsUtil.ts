import { ConstantsUtil } from './ConstantsUtil';

export const PresetsUtil = {
  ConnectorExplorerIds: {
    [ConstantsUtil.COINBASE_CONNECTOR_ID]:
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
  } as Record<string, string>,

  NetworkImageIds: {
    // Ethereum
    1: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
    // Arbitrum
    42161: '3bff954d-5cb0-47a0-9a23-d20192e74600',
    // Avalanche
    43114: '30c46e53-e989-45fb-4549-be3bd4eb3b00',
    // Binance Smart Chain
    56: '93564157-2e8e-4ce7-81df-b264dbee9b00',
    // Fantom
    250: '06b26297-fe0c-4733-5d6b-ffa5498aac00',
    // Optimism
    10: 'ab9c186a-c52f-464b-2906-ca59d760a400',
    // Polygon
    137: '41d04d42-da3b-4453-8506-668cc0727900',
    // Mantle
    5000: 'e86fae9b-b770-4eea-e520-150e12c81100',
    // Hedera Mainnet
    295: '6a97d510-cac8-4e58-c7ce-e8681b044c00',
    // Sepolia
    11_155_111: 'e909ea0a-f92a-4512-c8fc-748044ea6800',
    // Base Sepolia
    84532: 'a18a7ecd-e307-4360-4746-283182228e00',
    // Unichain Sepolia
    1301: '4eeea7ef-0014-4649-5d1d-07271a80f600',
    // Unichain Mainnet
    130: '2257980a-3463-48c6-cbac-a42d2a956e00',
    // Monad Testnet
    10_143: '0a728e83-bacb-46db-7844-948f05434900',
    // Gnosis
    100: '02b53f6a-e3d4-479e-1cb4-21178987d100',
    // EVMos
    9001: 'f926ff41-260d-4028-635e-91913fc28e00',
    // ZkSync
    324: 'b310f07f-4ef7-49f3-7073-2a0a39685800',
    // Filecoin
    314: '5a73b3dd-af74-424e-cae0-0de859ee9400',
    // Iotx
    4689: '34e68754-e536-40da-c153-6ef2e7188a00',
    // Metis,
    1088: '3897a66d-40b9-4833-162f-a2c90531c900',
    // Moonbeam
    1284: '161038da-44ae-4ec7-1208-0ea569454b00',
    // Moonriver
    1285: 'f1d73bb6-5450-4e18-38f7-fb6484264a00',
    // Zora
    7777777: '845c60df-d429-4991-e687-91ae45791600',
    // Celo
    42220: 'ab781bbc-ccc6-418d-d32d-789b15da1f00',
    // Base
    8453: '7289c336-3981-4081-c5f4-efc26ac64a00',
    // Aurora
    1313161554: '3ff73439-a619-4894-9262-4470c773a100',
    // Ronin Mainnet
    2020: 'b8101fc0-9c19-4b6f-ec65-f6dfff106e00',
    // Saigon Testnet (a.k.a. Ronin)
    2021: 'b8101fc0-9c19-4b6f-ec65-f6dfff106e00',
    // Berachain Mainnet
    80094: 'e329c2c9-59b0-4a02-83e4-212ff3779900',
    // Abstract Mainnet
    2741: 'fc2427d1-5af9-4a9c-8da5-6f94627cd900',

    // Solana networks
    /// Mainnet
    '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'a1b58899-f671-4276-6a5e-56ca5bd59700',
    /// Testnet
    '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'a1b58899-f671-4276-6a5e-56ca5bd59700',

    // Bitcoin
    '000000000019d6689c085ae165831e93': '0b4838db-0161-4ffe-022d-532bf03dba00',
    // Bitcoin Testnet
    '000000000933ea01ad0ee984209779ba': '39354064-d79b-420b-065d-f980c4b78200'
  } as Record<string, string>,

  ConnectorNamesMap: {
    [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: 'WalletConnect',
    [ConstantsUtil.COINBASE_CONNECTOR_ID]: 'Coinbase Wallet',
    [ConstantsUtil.AUTH_CONNECTOR_ID]: 'AppKit Universal Wallet'
  } as Record<string, string>,

  ConnectorImageIds: {
    [ConstantsUtil.COINBASE_CONNECTOR_ID]: '0c2840c3-5b04-4c44-9661-fbd4b49e1800',
    [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: 'ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400'
  } as Record<string, string>,

  RpcChainIds: [
    // Ethereum
    1,
    // Ethereum Goerli
    5,
    // Ethereum Sepolia
    11155111,
    // Optimism
    10,
    // Optimism Goerli
    420,
    // Arbitrum
    42161,
    // Arbitrum Goerli
    421613,
    // Polygon
    137,
    // Polygon Mumbai
    80001,
    // Celo Mainnet
    42220,
    // Aurora
    1313161554,
    // Aurora Testnet
    1313161555,
    // Binance Smart Chain
    56,
    // Binance Smart Chain Testnet
    97,
    // Avalanche C-Chain
    43114,
    // Avalanche Fuji Testnet
    43113,
    // Gnosis Chain
    100,
    // Base
    8453,
    // Base Goerli
    84531,
    // Zora
    7777777,
    // Zora Goerli
    999,
    // ZkSync Era Mainnet
    324,
    // ZkSync Era Testnet
    280
  ]
};
