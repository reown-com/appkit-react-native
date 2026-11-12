import type { WalletConnector } from '@reown/appkit-common-react-native';
import { UniversalConnector } from '../UniversalConnector';

// wagmi only ships ESM, so mock the pieces the connector imports.
// createConnector just returns the factory, which the tests call with a fake config.
jest.mock('wagmi', () => ({
  createConnector: (factory: unknown) => factory,
  ChainNotConfiguredError: class ChainNotConfiguredError extends Error {},
  ProviderNotFoundError: class ProviderNotFoundError extends Error {}
}));

const MAINNET_ID = 1;
const POLYGON_ID = 137;
const UNCONFIGURED_ID = 4663;

const createConfig = () => ({
  chains: [{ id: MAINNET_ID }, { id: POLYGON_ID }],
  emitter: { emit: jest.fn() }
});

const createConnectorInstance = (config: ReturnType<typeof createConfig>) => {
  const walletConnector = { getProvider: jest.fn() } as unknown as WalletConnector;
  const factory = UniversalConnector(walletConnector) as unknown as (
    config: ReturnType<typeof createConfig>
  ) => { onChainChanged(chain: string): void };

  return factory(config);
};

describe('UniversalConnector.onChainChanged', () => {
  let config: ReturnType<typeof createConfig>;
  let connector: ReturnType<typeof createConnectorInstance>;

  beforeEach(() => {
    config = createConfig();
    connector = createConnectorInstance(config);
  });

  it('emits change for a configured chain', () => {
    connector.onChainChanged(String(POLYGON_ID));

    expect(config.emitter.emit).toHaveBeenCalledTimes(1);
    expect(config.emitter.emit).toHaveBeenCalledWith('change', { chainId: POLYGON_ID });
  });

  it('emits change for a chain that is not in the wagmi config', () => {
    connector.onChainChanged(String(UNCONFIGURED_ID));

    expect(config.emitter.emit).toHaveBeenCalledTimes(1);
    expect(config.emitter.emit).toHaveBeenCalledWith('change', { chainId: UNCONFIGURED_ID });
  });

  it('accepts hex chain ids', () => {
    connector.onChainChanged('0x1237');

    expect(config.emitter.emit).toHaveBeenCalledWith('change', { chainId: UNCONFIGURED_ID });
  });

  it.each([
    ['a Solana chain reference', '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
    ['a Bitcoin chain reference', '000000000019d6689c085ae165831e93'],
    ['an empty string', ''],
    ['zero', '0'],
    ['a negative number', '-1'],
    ['a decimal number', '1.5'],
    ['a non-numeric string', 'not-a-chain']
  ])('does not emit for %s', (_, chain) => {
    connector.onChainChanged(chain);

    expect(config.emitter.emit).not.toHaveBeenCalled();
  });
});
