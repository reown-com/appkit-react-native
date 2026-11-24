import {
  ConnectionsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork, SIWXConfig, SIWXSession } from '@reown/appkit-common-react-native';
import type UniversalProvider from '@walletconnect/universal-provider';

import { FakeAdapter } from '@shared-test-utils/adapterFakes';
import { SIWXUtil } from '../../utils/SIWXUtil';

const ADDRESS = '0x1234567890123456789012345678901234567890';
const CAIP_ADDRESS = `eip155:1:${ADDRESS}` as const;

const mainnet = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1'
} as unknown as AppKitNetwork;

const siwxMessage = {
  nonce: 'nonce',
  domain: 'app.test',
  uri: 'https://app.test',
  version: '1',
  chainId: 'eip155:1',
  toString: () => 'Sign in to app.test'
};

const createSiwx = (overrides: Partial<SIWXConfig> = {}) =>
  ({
    createMessage: jest.fn().mockResolvedValue(siwxMessage),
    addSession: jest.fn().mockResolvedValue(undefined),
    revokeSession: jest.fn().mockResolvedValue(undefined),
    setSessions: jest.fn().mockResolvedValue(undefined),
    getSessions: jest.fn().mockResolvedValue([]),
    getRequired: jest.fn(() => false),
    ...overrides
  }) as unknown as SIWXConfig & Record<string, jest.Mock>;

const connect = () => {
  ConnectionsController.setNetworks([mainnet]);
  ConnectionsController.setConnection({
    accounts: [CAIP_ADDRESS],
    adapter: new FakeAdapter('eip155'),
    caipNetwork: 'eip155:1',
    namespace: 'eip155'
  });
  ConnectionsController.setActiveNamespace('eip155');
};

describe('SIWXUtil', () => {
  const onDisconnect = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    jest.spyOn(ModalController, 'open').mockResolvedValue(undefined);
    jest.spyOn(ModalController, 'close').mockImplementation(() => {});
    jest.spyOn(SnackController, 'showError').mockImplementation(() => {});
    ModalController.state.open = false;
    RouterController.reset('Connect');
    OptionsController.setSiwx(undefined);
    connect();
  });

  afterEach(async () => {
    await ConnectionsController.disconnect('eip155', false);
    jest.restoreAllMocks();
  });

  describe('initializeIfEnabled', () => {
    it('only closes the modal when SIWX is not set', async () => {
      await SIWXUtil.initializeIfEnabled({ onDisconnect, closeModal: true });

      expect(ModalController.close).toHaveBeenCalled();
      expect(ModalController.open).not.toHaveBeenCalled();
    });

    it('closes the modal when the account already has a session', async () => {
      const siwx = createSiwx({ getSessions: jest.fn().mockResolvedValue([{}]) });
      OptionsController.setSiwx(siwx);

      await SIWXUtil.initializeIfEnabled({ onDisconnect });

      expect(siwx.getSessions).toHaveBeenCalledWith('eip155:1', ADDRESS);
      expect(ModalController.close).toHaveBeenCalled();
      expect(ModalController.open).not.toHaveBeenCalled();
    });

    it('asks to sign when the account has no session', async () => {
      OptionsController.setSiwx(createSiwx());

      await SIWXUtil.initializeIfEnabled({ onDisconnect });

      expect(ModalController.open).toHaveBeenCalledWith({ view: 'SIWXSignMessage' });
    });

    it('goes to the sign view inside an open modal', async () => {
      OptionsController.setSiwx(createSiwx());
      ModalController.state.open = true;

      await SIWXUtil.initializeIfEnabled({ onDisconnect });

      expect(RouterController.state.view).toBe('SIWXSignMessage');
      expect(ModalController.open).not.toHaveBeenCalled();
    });

    it('skips networks AppKit was not set up with', async () => {
      const siwx = createSiwx();
      OptionsController.setSiwx(siwx);

      await SIWXUtil.initializeIfEnabled({ onDisconnect, caipAddress: `eip155:56:${ADDRESS}` });

      expect(siwx.getSessions).not.toHaveBeenCalled();
      expect(ModalController.open).not.toHaveBeenCalled();
    });

    it('disconnects and shows an error when the sessions check fails', async () => {
      OptionsController.setSiwx(
        createSiwx({ getSessions: jest.fn().mockRejectedValue(new Error('Server down')) })
      );

      await SIWXUtil.initializeIfEnabled({ onDisconnect });

      expect(onDisconnect).toHaveBeenCalledTimes(1);
      expect(SnackController.showError).toHaveBeenCalled();
    });
  });

  describe('requestSignMessage', () => {
    it('signs the message, stores the session and closes the modal', async () => {
      jest.useFakeTimers();
      const siwx = createSiwx();
      OptionsController.setSiwx(siwx);
      const signSpy = jest
        .spyOn(ConnectionsController, 'signMessage')
        .mockResolvedValue('0xsignature');

      const request = SIWXUtil.requestSignMessage();
      await jest.runAllTimersAsync();
      await request;

      expect(siwx.createMessage).toHaveBeenCalledWith({
        chainId: 'eip155:1',
        accountAddress: ADDRESS
      });
      expect(signSpy).toHaveBeenCalledWith(CAIP_ADDRESS, 'Sign in to app.test');
      expect(siwx.addSession).toHaveBeenCalledWith({
        data: siwxMessage,
        message: 'Sign in to app.test',
        signature: '0xsignature'
      });
      expect(ModalController.close).toHaveBeenCalled();
    });

    it("doesn't store a session when the user rejects the signature", async () => {
      const siwx = createSiwx();
      OptionsController.setSiwx(siwx);
      jest.spyOn(ConnectionsController, 'signMessage').mockRejectedValue(new Error('Rejected'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await SIWXUtil.requestSignMessage();

      expect(siwx.addSession).not.toHaveBeenCalled();
      expect(SnackController.showError).toHaveBeenCalledWith('Error signing message');
      expect(ModalController.open).toHaveBeenCalledWith({ view: 'SIWXSignMessage' });
    });

    it('throws when SIWX is not set', async () => {
      await expect(SIWXUtil.requestSignMessage()).rejects.toThrow('SIWX is not enabled');
    });
  });

  describe('cancelSignMessage', () => {
    it('disconnects when signing is required', async () => {
      OptionsController.setSiwx(createSiwx({ getRequired: () => true }));

      await SIWXUtil.cancelSignMessage(onDisconnect);

      expect(onDisconnect).toHaveBeenCalled();
    });

    it('only closes the modal when signing is optional', async () => {
      OptionsController.setSiwx(createSiwx());

      await SIWXUtil.cancelSignMessage(onDisconnect);

      expect(onDisconnect).not.toHaveBeenCalled();
      expect(ModalController.close).toHaveBeenCalled();
    });
  });

  describe('isSIWXCloseDisabled', () => {
    it('blocks closing the required sign view while there is no session', async () => {
      OptionsController.setSiwx(createSiwx({ getRequired: () => true }));
      RouterController.push('SIWXSignMessage');

      await expect(SIWXUtil.isSIWXCloseDisabled()).resolves.toBe(true);
    });

    it('allows closing once there is a session', async () => {
      OptionsController.setSiwx(
        createSiwx({ getRequired: () => true, getSessions: jest.fn().mockResolvedValue([{}]) })
      );
      RouterController.push('SIWXSignMessage');

      await expect(SIWXUtil.isSIWXCloseDisabled()).resolves.toBe(false);
    });
  });

  describe('universalProviderAuthenticate', () => {
    const cacao = {
      p: {
        iss: `did:pkh:eip155:1:${ADDRESS}`,
        aud: 'https://app.test',
        version: '1',
        nonce: 'nonce',
        domain: 'app.test',
        iat: '2026-01-01T00:00:00Z'
      },
      s: { s: '0xsignature', t: 'eip191' }
    };

    const createUniversalProvider = (auths = [cacao]) =>
      ({
        authenticate: jest.fn().mockResolvedValue({ auths, session: { topic: 'topic' } }),
        disconnect: jest.fn().mockResolvedValue(undefined),
        client: { formatAuthMessage: jest.fn(() => 'formatted message') }
      }) as unknown as UniversalProvider & Record<string, jest.Mock>;

    it('stores one session per signed auth and returns the session', async () => {
      const siwx = createSiwx();
      OptionsController.setSiwx(siwx);
      const universalProvider = createUniversalProvider();

      const session = await SIWXUtil.universalProviderAuthenticate({
        universalProvider,
        chains: ['eip155:1'],
        methods: []
      });

      expect(session).toEqual({ topic: 'topic' });
      const [sessions] = (siwx.setSessions as jest.Mock).mock.calls[0] as [SIWXSession[]];
      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(
        expect.objectContaining({
          message: 'formatted message',
          signature: '0xsignature',
          data: expect.objectContaining({ accountAddress: ADDRESS, chainId: 'eip155:1' })
        })
      );
    });

    it('closes the session and rethrows when the sessions cannot be stored', async () => {
      OptionsController.setSiwx(
        createSiwx({ setSessions: jest.fn().mockRejectedValue(new Error('Invalid signature')) })
      );
      const universalProvider = createUniversalProvider();
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        SIWXUtil.universalProviderAuthenticate({
          universalProvider,
          chains: ['eip155:1'],
          methods: []
        })
      ).rejects.toThrow('Invalid signature');

      expect(universalProvider.disconnect).toHaveBeenCalled();
    });

    it('is skipped for non-EVM chains', async () => {
      OptionsController.setSiwx(createSiwx());
      const universalProvider = createUniversalProvider();

      const session = await SIWXUtil.universalProviderAuthenticate({
        universalProvider,
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        methods: []
      });

      expect(session).toBeUndefined();
      expect(universalProvider.authenticate).not.toHaveBeenCalled();
    });
  });
});
