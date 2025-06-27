import { BlockchainAdapter } from './BlockchainAdapter';
import { NumberUtil } from '../utils/NumberUtil';

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

  async sendTransaction(data: any) {
    const { address } = data || {};

    if (!this.getProvider()) {
      throw new Error('EVMAdapter:sendTransaction - provider is undefined');
    }

    if (!address) {
      throw new Error('EVMAdapter:sendTransaction - address is undefined');
    }

    const txParams = {
      from: address,
      to: data.to,
      value: NumberUtil.convertNumericToHexString(data.value),
      gas: NumberUtil.convertNumericToHexString(data.gas),
      gasPrice: NumberUtil.convertNumericToHexString(data.gasPrice),
      data: data.data, // hex-encoded bytecode
      type: '0x0' // optional: legacy transaction type
    };

    const txHash = await this.getProvider().request({
      method: 'eth_sendTransaction',
      params: [txParams]
    });

    let receipt = null;
    while (!receipt) {
      receipt = (await this.getProvider().request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })) as { blockHash?: `0x${string}` };

      if (!receipt) {
        await new Promise(r => setTimeout(r, 1000)); // wait 1s
      }
    }

    return receipt?.blockHash || null;
  }
}
