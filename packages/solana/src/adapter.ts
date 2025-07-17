import {
  SolanaBaseAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { getSolanaNativeBalance, getSolanaTokenBalance } from './helpers';
import { Connection } from '@solana/web3.js';
import base58 from 'bs58';
import { createSendTransaction } from './utils/createSendTransaction';

// Type definitions for Solana transaction data
export interface SolanaTransactionData {
  fromAddress: string;
  toAddress: string;
  amount: number; // in SOL (will be converted to lamports)
  network?: AppKitNetwork;
  rpcUrl?: string;
}

export class SolanaAdapter extends SolanaBaseAdapter {
  private static supportedNamespace: ChainNamespace = 'solana';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
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

  /**
   * Sends a Solana transaction using the connected wallet.
   * This function creates and sends a native SOL transfer transaction.
   *
   * @param data - The transaction data
   * @param data.fromAddress - The sender's address (base58 format)
   * @param data.toAddress - The recipient's address (base58 format)
   * @param data.amount - The amount to send in SOL (will be converted to lamports)
   * @param data.network - Optional network configuration for RPC URL
   * @param data.rpcUrl - Optional custom RPC URL
   *
   * @returns Promise resolving to the transaction signature or null if failed
   *
   * @example
   * ```typescript
   * const result = await adapter.sendTransaction({
   *   fromAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
   *   toAddress: 'ComputeBudget111111111111111111111111111111',
   *   amount: 0.001, // 0.001 SOL
   *   network: solanaNetwork
   * });
   * ```
   */
  async sendTransaction(data: SolanaTransactionData): Promise<string | null> {
    const { fromAddress, toAddress, amount, network, rpcUrl } = data;

    if (!this.connector) {
      throw new Error('SolanaAdapter:sendTransaction - no active connector');
    }

    const provider = this.connector.getProvider();
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

      const transaction = await createSendTransaction({
        connection,
        fromAddress,
        toAddress,
        value: amount
      });

      // Encode to base58
      const base58EncodedTransaction = base58.encode(
        transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false
        })
      );

      // Send transaction through wallet
      const { signature } = (await provider.request(
        {
          method: 'solana_signAndSendTransaction',
          params: { transaction: base58EncodedTransaction }
        },
        network.caipNetworkId
      )) as { signature: string };

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

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
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
