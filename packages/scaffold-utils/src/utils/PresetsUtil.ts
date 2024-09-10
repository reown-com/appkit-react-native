import type { ConnectorType } from '@reown/scaffold-react-native';
import { ConstantsUtil } from './ConstantsUtil';

export const PresetsUtil = {
  ConnectorExplorerIds: {
    [ConstantsUtil.COINBASE_CONNECTOR_ID]:
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
  } as Record<string, string>,

  EIP155NetworkImageIds: {
    // Ethereum
    1: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
    // Arbitrum
    42161: '600a9a04-c1b9-42ca-6785-9b4b6ff85200',
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
    1313161554: '3ff73439-a619-4894-9262-4470c773a100'
  } as Record<string, string>,

  ConnectorImageIds: {
    [ConstantsUtil.COINBASE_CONNECTOR_ID]: '0c2840c3-5b04-4c44-9661-fbd4b49e1800',
    [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: 'ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400'
  } as Record<string, string>,

  ConnectorNamesMap: {
    [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: 'WalletConnect',
    [ConstantsUtil.COINBASE_CONNECTOR_ID]: 'Coinbase',
    [ConstantsUtil.EMAIL_CONNECTOR_ID]: 'Email'
  } as Record<string, string>,

  ConnectorTypesMap: {
    [ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID]: 'WALLET_CONNECT',
    [ConstantsUtil.COINBASE_CONNECTOR_ID]: 'COINBASE',
    [ConstantsUtil.EMAIL_CONNECTOR_ID]: 'EMAIL'
  } as Record<string, ConnectorType>,

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
