import { BlockchainAdapter } from './BlockchainAdapter';

export abstract class SolanaBaseAdapter extends BlockchainAdapter {
  abstract sendTransaction(data: any): Promise<string | null>;
}
