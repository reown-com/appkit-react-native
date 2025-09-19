import { BlockchainAdapter } from './BlockchainAdapter';
import { NumberUtil } from '../utils/NumberUtil';
import type { AppKitNetwork } from '../types';

// Type definitions for writeContract
export interface WriteContractData {
  tokenAddress: `0x${string}`;
  receiverAddress: `0x${string}`;
  tokenAmount: bigint;
  fromAddress: `0x${string}`;
  method: 'transfer' | 'transferFrom' | 'approve';
  abi?: any; // Optional ABI for future extensibility
  spenderAddress?: `0x${string}`; // Required for transferFrom and approve
  network: AppKitNetwork;
}

export interface SendTransactionData {
  address: `0x${string}`;
  network: AppKitNetwork;
  to: `0x${string}`;
  value: string;
  data: string;
}

// Simple ABI encoder for ERC20 functions
function encodeERC20Function(method: string, params: any[]): string {
  const functionSelectors = {
    transfer: '0xa9059cbb', // transfer(address,uint256)
    transferFrom: '0x23b872dd', // transferFrom(address,address,uint256)
    approve: '0x095ea7b3' // approve(address,uint256)
  };

  const selector = functionSelectors[method as keyof typeof functionSelectors];
  if (!selector) {
    throw new Error(`EVMAdapter:encodeERC20Function - unsupported method: ${method}`);
  }

  let encodedParams = '';

  switch (method) {
    case 'transfer':
      if (params.length !== 2) throw new Error('transfer requires 2 parameters: to, amount');
      const [to, amount] = params;
      encodedParams =
        to.toLowerCase().slice(2).padStart(64, '0') + amount.toString(16).padStart(64, '0');
      break;

    case 'transferFrom':
      if (params.length !== 3)
        throw new Error('transferFrom requires 3 parameters: from, to, amount');
      const [from, toTransferFrom, amountTransferFrom] = params;
      encodedParams =
        from.toLowerCase().slice(2).padStart(64, '0') +
        toTransferFrom.toLowerCase().slice(2).padStart(64, '0') +
        amountTransferFrom.toString(16).padStart(64, '0');
      break;

    case 'approve':
      if (params.length !== 2) throw new Error('approve requires 2 parameters: spender, amount');
      const [spender, amountApprove] = params;
      encodedParams =
        spender.toLowerCase().slice(2).padStart(64, '0') +
        amountApprove.toString(16).padStart(64, '0');
      break;

    default:
      throw new Error(`EVMAdapter:encodeERC20Function - unsupported method: ${method}`);
  }

  return selector + encodedParams;
}

export abstract class EVMAdapter extends BlockchainAdapter {
  async signMessage(address: string, message: string, chain?: string): Promise<string> {
    const provider = this.getProvider();

    if (!provider) {
      throw new Error('EVMAdapter:signMessage - provider is undefined');
    }

    const signature = await provider.request(
      {
        method: 'personal_sign',
        params: [message, address]
      },
      `eip155:${chain}`
    );

    return signature as string;
  }
  async estimateGas({ address, to, data, chainNamespace }: any): Promise<bigint> {
    const provider = this.getProvider();

    if (!provider) {
      throw new Error('EVMAdapter:estimateGas - provider is undefined');
    }

    if (!address) {
      throw new Error('EVMAdapter:estimateGas - from address is undefined');
    }

    if (chainNamespace && chainNamespace !== 'eip155') {
      throw new Error('EVMAdapter:estimateGas - chainNamespace is not eip155');
    }

    try {
      const txParams = {
        from: address,
        to,
        data,
        type: '0x0' // optional, legacy type
      };

      const estimatedGasHex = await provider.request({
        method: 'eth_estimateGas',
        params: [txParams]
      });

      return BigInt(estimatedGasHex as string);
    } catch (error) {
      throw new Error('EVMAdapter:estimateGas - eth_estimateGas RPC failed');
    }
  }

  async sendTransaction(data: SendTransactionData): Promise<`0x${string}` | null> {
    const { address, network } = data || {};

    if (!this.getProvider()) {
      throw new Error('EVMAdapter:sendTransaction - provider is undefined');
    }

    if (!address) {
      throw new Error('EVMAdapter:sendTransaction - address is undefined');
    }

    if (!network) {
      throw new Error('EVMAdapter:sendTransaction - network is undefined');
    }

    const txParams = {
      from: address,
      to: data.to,
      value: NumberUtil.convertNumericToHexString(data.value),
      data: data.data, // hex-encoded bytecode
      type: '0x0' // optional: legacy transaction type
    };

    const txHash = await this.getProvider().request(
      {
        method: 'eth_sendTransaction',
        params: [txParams]
      },
      network.caipNetworkId
    );

    return txHash as `0x${string}` | null;
  }

  async writeContract(data: WriteContractData): Promise<`0x${string}` | null> {
    const {
      tokenAddress,
      receiverAddress,
      tokenAmount,
      method,
      fromAddress,
      spenderAddress,
      network
    } = data;

    if (!this.getProvider()) {
      throw new Error('EVMAdapter:writeContract - provider is undefined');
    }

    if (!fromAddress) {
      throw new Error('EVMAdapter:writeContract - fromAddress is undefined');
    }

    if (!tokenAddress) {
      throw new Error('EVMAdapter:writeContract - tokenAddress is undefined');
    }

    if (!tokenAmount) {
      throw new Error('EVMAdapter:writeContract - tokenAmount is undefined');
    }

    if (!method) {
      throw new Error('EVMAdapter:writeContract - method is undefined');
    }

    // Validate method-specific parameters
    if (method === 'transfer' && !receiverAddress) {
      throw new Error('EVMAdapter:writeContract - receiverAddress is required for transfer method');
    }

    if ((method === 'transferFrom' || method === 'approve') && !spenderAddress) {
      throw new Error(`EVMAdapter:writeContract - spenderAddress is required for ${method} method`);
    }

    // Encode the function call data based on method
    let encodedData: string;

    switch (method) {
      case 'transfer':
        encodedData = encodeERC20Function('transfer', [receiverAddress, tokenAmount]);
        break;
      case 'transferFrom':
        encodedData = encodeERC20Function('transferFrom', [
          fromAddress,
          receiverAddress,
          tokenAmount
        ]);
        break;
      case 'approve':
        encodedData = encodeERC20Function('approve', [spenderAddress, tokenAmount]);
        break;
      default:
        throw new Error(`EVMAdapter:writeContract - method '${method}' is not supported`);
    }

    // Create transaction parameters
    const txParams = {
      from: fromAddress,
      to: tokenAddress,
      data: encodedData,
      value: '0x0', // No ETH value for token operations
      type: '0x0' // legacy transaction type
    };

    try {
      // Send the transaction
      const txHash = await this.getProvider().request(
        {
          method: 'eth_sendTransaction',
          params: [txParams]
        },
        network.caipNetworkId
      );

      return txHash as `0x${string}` | null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`EVMAdapter:writeContract - ${error.message}`);
      }
      throw new Error('EVMAdapter:writeContract - unknown error occurred');
    }
  }
}
