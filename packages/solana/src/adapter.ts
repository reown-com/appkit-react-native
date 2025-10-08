import {
  SolanaBaseAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { getSolanaNativeBalance, getSolanaTokenBalance } from './helpers';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import base58 from 'bs58';
import { createSendTransaction } from './utils/createSendTransaction';
import { createSPLTokenTransaction } from './utils/createSPLTokenTransaction';

export interface SolanaTransactionData {
  fromAddress: string;
  toAddress: string;
  amount: number;
  network?: AppKitNetwork;
  rpcUrl?: string;
  tokenMint?: string;
}

export class SolanaAdapter extends SolanaBaseAdapter {
  private static supportedNamespace: ChainNamespace = 'solana';

  constructor() {
    super({
      supportedNamespace: SolanaAdapter.supportedNamespace,
      adapterType: 'solana'
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address, tokens } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    if (!balanceAddress) {
      return { amount: '0.00', symbol: 'SOL' };
    }

    try {
      const rpcUrl = network.rpcUrls?.default?.http?.[0];
      if (!rpcUrl) throw new Error('No RPC URL available');

      const base58Address = balanceAddress.split(':')[2];

      if (!base58Address) throw new Error('Invalid balance address');

      const token = network?.caipNetworkId && tokens?.[network.caipNetworkId]?.address;
      let balance;

      if (token) {
        const { amount, symbol } = await getSolanaTokenBalance(rpcUrl, base58Address, token);
        balance = {
          amount,
          symbol
        };
      } else {
        const amount = await getSolanaNativeBalance(rpcUrl, base58Address);
        balance = {
          amount: amount.toString(),
          symbol: 'SOL'
        };
      }

      this.emit('balanceChanged', { address: balanceAddress, balance });

      return balance;
    } catch (error) {
      return { amount: '0.00', symbol: 'SOL' };
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    network?: AppKitNetwork
  ): Promise<T> {
    if (!this.connector) {
      throw new Error('SolanaAdapter:signTransaction - no active connector');
    }

    if (!network) {
      throw new Error('SolanaAdapter:signTransaction - network is undefined');
    }

    const provider = this.connector.getProvider('solana');
    if (!provider) {
      throw new Error('SolanaAdapter:signTransaction - provider is undefined');
    }

    try {
      // Check if this is a deeplink provider (Phantom/Solflare)
      const isDeeplinkProvider =
        this.connector.type === 'phantom' || this.connector.type === 'solflare';

      // Serialize transaction based on provider type
      let serializedTransaction: string;
      if (isDeeplinkProvider) {
        // Deeplink providers (Phantom/Solflare) expect base58
        const transactionBytes = new Uint8Array(transaction.serialize({ verifySignatures: false }));
        serializedTransaction = base58.encode(transactionBytes);
      } else {
        // WalletConnect providers expect base64 (following WalletConnect standard)
        serializedTransaction = Buffer.from(
          new Uint8Array(transaction.serialize({ verifySignatures: false }))
        ).toString('base64');
      }

      const result = (await provider.request(
        {
          method: 'solana_signTransaction',
          params: {
            transaction: serializedTransaction,
            pubkey: this.getAccounts()?.[0]?.split(':')[2] || ''
          }
        },
        network.caipNetworkId
      )) as { signature?: string; transaction?: string };

      // Handle different response formats
      if ('signature' in result && result.signature) {
        // Old RPC response format - add signature to transaction
        const decoded = base58.decode(result.signature);
        if (transaction instanceof Transaction && transaction.feePayer) {
          transaction.addSignature(
            transaction.feePayer,
            Buffer.from(decoded) as Buffer & Uint8Array
          );
        }

        return transaction;
      }

      if ('transaction' in result && result.transaction) {
        // New response format - deserialize the signed transaction
        let decodedTransaction: Buffer;

        if (isDeeplinkProvider) {
          // Deeplink providers return base58 encoded transactions
          try {
            const decodedBytes = base58.decode(result.transaction);
            decodedTransaction = Buffer.from(decodedBytes);
          } catch (error) {
            throw new Error('Failed to decode base58 transaction from deeplink provider');
          }
        } else {
          // WalletConnect providers return base64 encoded transactions
          decodedTransaction = Buffer.from(result.transaction, 'base64');
        }

        if (transaction instanceof VersionedTransaction) {
          return VersionedTransaction.deserialize(new Uint8Array(decodedTransaction)) as T;
        }

        return Transaction.from(decodedTransaction) as T;
      }

      throw new Error('SolanaAdapter:signTransaction - invalid response format');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`SolanaAdapter:signTransaction - ${error.message}`);
      }
      throw new Error('SolanaAdapter:signTransaction - unknown error occurred');
    }
  }

  async sendTransaction(data: SolanaTransactionData): Promise<string | null> {
    const { fromAddress, toAddress, amount, network, rpcUrl, tokenMint } = data;

    if (!this.connector) {
      throw new Error('SolanaAdapter:sendTransaction - no active connector');
    }

    const provider = this.connector.getProvider('solana');
    if (!provider) {
      throw new Error('SolanaAdapter:sendTransaction - provider is undefined');
    }

    if (!network) {
      throw new Error('SolanaAdapter:sendTransaction - network is undefined');
    }

    if (!fromAddress) {
      throw new Error('SolanaAdapter:sendTransaction - fromAddress is undefined');
    }

    if (!toAddress) {
      throw new Error('SolanaAdapter:sendTransaction - toAddress is undefined');
    }

    if (!amount || amount <= 0) {
      throw new Error('SolanaAdapter:sendTransaction - amount must be greater than 0');
    }

    try {
      // Determine RPC URL
      let connectionRpcUrl = rpcUrl;
      if (!connectionRpcUrl && network) {
        connectionRpcUrl = network.rpcUrls?.default?.http?.[0];
      }
      if (!connectionRpcUrl) {
        throw new Error('SolanaAdapter:sendTransaction - no RPC URL available');
      }

      // Create connection
      const connection = new Connection(connectionRpcUrl, 'confirmed');

      const transaction = tokenMint
        ? await createSPLTokenTransaction({
            connection,
            fromAddress,
            toAddress,
            amount,
            tokenMint
          })
        : await createSendTransaction({
            connection,
            fromAddress,
            toAddress,
            amount
          });

      // Sign the transaction
      const signedTransaction = await this.signTransaction(transaction, network);

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      if (!signature) {
        throw new Error('SolanaAdapter:sendTransaction - no signature returned');
      }

      return signature;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`SolanaAdapter:sendTransaction - ${error.message}`);
      }
      throw new Error('SolanaAdapter:sendTransaction - unknown error occurred');
    }
  }

  override async signMessage(address: string, message: string, chainId?: string): Promise<string> {
    try {
      if (!this.connector) {
        throw new Error('SolanaAdapter:signMessage - no active connector');
      }

      const provider = this.connector.getProvider('solana');
      if (!provider) {
        throw new Error('SolanaAdapter:signMessage - provider is undefined');
      }

      const chain = chainId ? `${this.getSupportedNamespace()}:${chainId}` : undefined;

      const encodedMessage = new TextEncoder().encode(message);
      const params = {
        message: base58.encode(encodedMessage),
        pubkey: address
        // For Phantom, pubkey is not part of signMessage params directly with session
        // For other wallets, it might be needed if they don't infer from session
      };
      const { signature } = (await provider.request(
        { method: 'solana_signMessage', params },
        chain
      )) as {
        signature: string;
      };

      return signature;
    } catch (error) {
      throw error;
    }
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider('solana');
    if (!provider) throw new Error('No active provider');

    try {
      await this.connector.switchNetwork(network);

      return;
    } catch (switchError: any) {
      throw switchError;
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  disconnect(): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    return this.connector.disconnect();
  }

  getSupportedNamespace(): ChainNamespace {
    return SolanaAdapter.supportedNamespace;
  }
}
