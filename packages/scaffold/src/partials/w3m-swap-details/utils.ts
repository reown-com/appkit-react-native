export interface ModalData {
  detail: ModalDetail;
  opts?: ModalDataOpts;
}

export type ModalDetail = 'slippage' | 'networkCost' | 'priceImpact';

export interface ModalDataOpts {
  networkSymbol?: string;
  networkName?: string;
  minimumReceive?: string;
  toTokenSymbol?: string;
}

export const getModalData = (detail: ModalDetail, opts?: ModalDataOpts) => {
  switch (detail) {
    case 'slippage':
      return {
        title: 'Max. slippage',
        description: `Max slippage sets the minimum amount you must receive for the transaction to proceed. The transaction will be reversed if you receive less than ${opts?.minimumReceive} ${opts?.toTokenSymbol} due to price changes`
      };
    case 'networkCost':
      return {
        title: 'Network cost',
        description: `Network cost is paid in ${opts?.networkSymbol} on the ${opts?.networkName} network in order to execute the transaction`
      };
    case 'priceImpact':
      return {
        title: 'Price impact',
        description: 'Price impact reflects the change in market price due to your trade'
      };
  }
};
