import { CreateConfigParameters } from 'wagmi';
import {
  arbitrum,
  mainnet,
  polygon,
  avalanche,
  bsc,
  optimism,
  gnosis,
  zora,
  base,
  celo,
  aurora,
  sepolia
} from 'wagmi/chains';

export const chains: CreateConfigParameters['chains'] = [
  mainnet,
  polygon,
  avalanche,
  arbitrum,
  bsc,
  optimism,
  gnosis,
  zora,
  base,
  celo,
  aurora,
  sepolia
];
