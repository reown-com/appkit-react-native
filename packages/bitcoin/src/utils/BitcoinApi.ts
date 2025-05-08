import type { AppKitNetwork } from '@reown/appkit-common-react-native';

export const BitcoinApi: BitcoinApi.Interface = {
  getUTXOs: async ({ network, address }: BitcoinApi.GetUTXOsParams): Promise<BitcoinApi.UTXO[]> => {
    const isTestnet = network.caipNetworkId === 'bip122:000000000933ea01ad0ee984209779ba';
    // Make chain dynamic

    //TODO: Call rpc to get balance
    const url = `https://mempool.space${isTestnet ? '/testnet' : ''}/api/address/${address}/utxo`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${await response.text()}`);
    }

    return (await response.json()) as BitcoinApi.UTXO[];
  }
};

export namespace BitcoinApi {
  export type Interface = {
    getUTXOs: (params: GetUTXOsParams) => Promise<UTXO[]>;
  };

  export type GetUTXOsParams = {
    network: AppKitNetwork;
    address: string;
  };

  export type UTXO = {
    txid: string;
    vout: number;
    value: number;
    status: {
      confirmed: boolean;
      block_height: number;
      block_hash: string;
      block_time: number;
    };
  };
}
