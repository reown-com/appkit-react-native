import { COINBASE_METHODS, getCoinbaseNamespace } from '../utils';

describe('getCoinbaseNamespace', () => {
  it('builds eip155 accounts for every requested chain', () => {
    const namespaces = getCoinbaseNamespace(
      {
        eip155: {
          chains: ['eip155:1', 'eip155:137'],
          methods: [],
          events: ['chainChanged'],
          rpcMap: {}
        }
      },
      ['0xabc']
    );

    expect(namespaces).toEqual({
      eip155: {
        chains: ['eip155:1', 'eip155:137'],
        events: ['chainChanged'],
        rpcMap: {},
        methods: Object.values(COINBASE_METHODS),
        accounts: ['eip155:1:0xabc', 'eip155:137:0xabc']
      }
    });
  });

  it('throws when namespaces, accounts or the eip155 namespace are missing', () => {
    expect(() => getCoinbaseNamespace(undefined, ['0xabc'])).toThrow(
      'Namespaces or accounts not found'
    );
    expect(() => getCoinbaseNamespace({ eip155: { chains: [] } } as any)).toThrow(
      'Namespaces or accounts not found'
    );
    expect(() => getCoinbaseNamespace({}, ['0xabc'])).toThrow('Namespace not found');
  });
});
