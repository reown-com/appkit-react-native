import { BlockchainAdapter } from './BlockchainAdapter';

export abstract class SolanaBaseAdapter extends BlockchainAdapter {
  abstract signTransaction(data: any): Promise<string | null>;
  abstract sendTransaction(data: any): Promise<string | null>;
  abstract signMessage(address: string, message: string): Promise<string>;
}
