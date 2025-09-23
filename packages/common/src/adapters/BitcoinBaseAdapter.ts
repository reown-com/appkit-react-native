import { BlockchainAdapter } from './BlockchainAdapter';

export abstract class BitcoinBaseAdapter extends BlockchainAdapter {
  abstract signMessage(address: string, message: string, chainId?: string): Promise<string>;
}
