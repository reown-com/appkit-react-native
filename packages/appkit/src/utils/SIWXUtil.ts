import UniversalProvider from '@walletconnect/universal-provider';

import {
  type CaipNetworkId,
  type ChainNamespace,
  type SIWXSession
} from '@reown/appkit-common-react-native';

import {
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  CoreHelperUtil,
  ConnectionsController,
  EventsController
} from '@reown/appkit-core-react-native';
import { Alert } from 'react-native';

/**
 * SIWXUtil holds the methods to interact with the SIWX plugin and must be called internally on AppKit.
 */

export const SIWXUtil = {
  getSIWX() {
    return OptionsController.state.siwx;
  },

  async initializeIfEnabled({
    onDisconnect,
    caipAddress = ConnectionsController.state.activeAddress,
    closeModal = false
  }: {
    onDisconnect: () => Promise<void>;
    caipAddress?: string;
    closeModal?: boolean;
  }) {
    const siwx = OptionsController.state.siwx;

    if (!siwx || !caipAddress) {
      if (closeModal) {
        ModalController.close();
      }

      return;
    }

    const [namespace, chainId, address] = caipAddress.split(':') as [
      ChainNamespace,
      string,
      string
    ];

    const isSupportedNetwork = ConnectionsController.getAvailableNetworks().find(
      network => network.caipNetworkId === `${namespace}:${chainId}`
    );

    if (!isSupportedNetwork) {
      return;
    }

    try {
      const sessions = await siwx.getSessions(`${namespace}:${chainId}`, address);

      if (sessions.length) {
        ModalController.close();

        return;
      }

      if (ModalController.state.open) {
        RouterController.push('SIWXSignMessage');
      } else {
        ModalController.open({ view: 'SIWXSignMessage' });
      }
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('SIWXUtil:initializeIfEnabled error', error);

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties: this.getSIWXEventProperties(error)
      });

      await onDisconnect();
      SnackController.showError('A problem occurred while trying initialize authentication');
    }
  },
  async requestSignMessage() {
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_SIGN_SIWX_MESSAGE',
      properties: this.getSIWXEventProperties()
    });

    const siwx = OptionsController.state.siwx;

    const address = ConnectionsController.state.activeAddress;
    const plainAddress = CoreHelperUtil.getPlainAddress(address);
    const network = ConnectionsController.state.activeNetwork;

    if (!siwx) {
      throw new Error('SIWX is not enabled');
    }

    if (!address || !plainAddress) {
      throw new Error('No ActiveCaipAddress found');
    }

    if (!network) {
      throw new Error('No ActiveCaipNetwork or client found');
    }

    try {
      const siwxMessage = await siwx.createMessage({
        chainId: network.caipNetworkId,
        accountAddress: plainAddress
      });

      const message = siwxMessage.toString();

      const signature = await ConnectionsController.signMessage(address, message);

      if (!signature) {
        throw new Error('Error signing message');
      }

      SnackController.showLoading('Authenticating...', true);

      // Add a small delay to allow the app to fully restore network connectivity
      // after returning from background (wallet redirect)
      await new Promise(resolve => setTimeout(resolve, 500));

      await siwx.addSession({
        data: siwxMessage,
        message,
        signature
      });

      ModalController.close();

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_SUCCESS',
        properties: this.getSIWXEventProperties()
      });
    } catch (error) {
      if (!ModalController.state.open) {
        await ModalController.open({
          view: 'SIWXSignMessage'
        });
      }

      // @ts-ignore
      Alert.alert('Error signing message', error?.message ?? error);

      SnackController.showError('Error signing message');
      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties: this.getSIWXEventProperties(error)
      });

      // eslint-disable-next-line no-console
      console.error('SIWXUtil:requestSignMessage', error);
    }
  },
  async cancelSignMessage(onDisconnect: () => Promise<void>) {
    try {
      const siwx = this.getSIWX();
      const isRequired = siwx?.getRequired?.();
      if (isRequired) {
        await onDisconnect();
      } else {
        ModalController.close();
      }

      EventsController.sendEvent({
        event: 'CLICK_CANCEL_SIWX',
        type: 'track',
        properties: this.getSIWXEventProperties()
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SIWXUtil:cancelSignMessage', error);
    }
  },
  async getAllSessions() {
    const siwx = this.getSIWX();
    const allRequestedCaipNetworks = ConnectionsController.state.networks;
    const sessions = [] as SIWXSession[];
    await Promise.all(
      allRequestedCaipNetworks.map(async caipNetwork => {
        const session = await siwx?.getSessions(
          caipNetwork.caipNetworkId,
          CoreHelperUtil.getPlainAddress(ConnectionsController.state.activeAddress) || ''
        );
        if (session) {
          sessions.push(...session);
        }
      })
    );

    return sessions;
  },
  async getSessions(args?: { address?: string; caipNetworkId?: CaipNetworkId }) {
    const siwx = OptionsController.state.siwx;
    let address = args?.address;
    if (!address) {
      const activeCaipAddress = ConnectionsController.state.activeAddress;
      address = CoreHelperUtil.getPlainAddress(activeCaipAddress);
    }

    let network = args?.caipNetworkId;
    if (!network) {
      const activeCaipNetwork = ConnectionsController.state.activeNetwork;
      network = activeCaipNetwork?.caipNetworkId;
    }

    if (!siwx || !address || !network) {
      return [];
    }

    return siwx.getSessions(network, address);
  },
  async isSIWXCloseDisabled() {
    const siwx = this.getSIWX();

    if (siwx) {
      const isSiwxSignMessage = RouterController.state.view === 'SIWXSignMessage';

      if (isSiwxSignMessage) {
        return siwx.getRequired?.() && (await this.getSessions()).length === 0;
      }
    }

    return false;
  },

  async universalProviderAuthenticate({
    universalProvider,
    chains,
    methods,
    universalLink
  }: {
    universalProvider: UniversalProvider;
    chains: CaipNetworkId[];
    methods: string[];
    universalLink?: string;
  }) {
    const siwx = SIWXUtil.getSIWX();
    const namespaces = new Set(chains.map(chain => chain.split(':')[0] as ChainNamespace));

    if (!siwx || namespaces.size !== 1 || !namespaces.has('eip155')) {
      return undefined;
    }

    // Ignores chainId and account address to get other message data
    const siwxMessage = await siwx.createMessage({
      chainId: OptionsController.state.defaultNetwork?.caipNetworkId || ('' as CaipNetworkId),
      accountAddress: ''
    });

    let messageChains = chains;

    if (OptionsController.state.defaultNetwork?.caipNetworkId) {
      // The first chainId is what is used for universal provider to build the message
      messageChains = [
        OptionsController.state.defaultNetwork?.caipNetworkId,
        ...chains.filter(chain => chain !== OptionsController.state.defaultNetwork?.caipNetworkId)
      ];
    }

    const result = await universalProvider.authenticate(
      {
        nonce: siwxMessage.nonce,
        domain: siwxMessage.domain,
        uri: siwxMessage.uri,
        exp: siwxMessage.expirationTime,
        iat: siwxMessage.issuedAt,
        nbf: siwxMessage.notBefore,
        requestId: siwxMessage.requestId,
        version: siwxMessage.version,
        resources: siwxMessage.resources,
        statement: siwxMessage.statement,
        chainId: siwxMessage.chainId,
        methods,
        chains: messageChains
      },
      universalLink
    );

    SnackController.showLoading('Authenticating...', true);

    if (result?.auths?.length) {
      const sessions = result.auths.map<SIWXSession>(cacao => {
        const message = universalProvider.client.formatAuthMessage({
          request: cacao.p,
          iss: cacao.p.iss
        });

        return {
          data: {
            ...cacao.p,
            accountAddress: cacao.p.iss.split(':').slice(-1).join(''),
            chainId: cacao.p.iss.split(':').slice(2, 4).join(':') as CaipNetworkId,
            uri: cacao.p.aud,
            version: cacao.p.version || siwxMessage.version,
            expirationTime: cacao.p.exp,
            issuedAt: cacao.p.iat,
            notBefore: cacao.p.nbf
          },
          message,
          signature: cacao.s.s,
          cacao
        };
      });

      try {
        await siwx.setSessions(sessions);

        EventsController.sendEvent({
          type: 'track',
          event: 'SIWX_AUTH_SUCCESS',
          properties: SIWXUtil.getSIWXEventProperties()
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SIWX:universalProviderAuth - failed to set sessions', error);

        EventsController.sendEvent({
          type: 'track',
          event: 'SIWX_AUTH_ERROR',
          properties: SIWXUtil.getSIWXEventProperties(error)
        });

        // eslint-disable-next-line no-console
        await universalProvider.disconnect().catch(console.error);
        throw error;
      } finally {
        SnackController.hide();
      }
    }

    return result?.session;
  },
  getSIWXEventProperties(error?: unknown) {
    return {
      network: ConnectionsController.state.activeNetwork?.caipNetworkId || '',
      isSmartAccount: ConnectionsController.state.accountType === 'smartAccount',
      message: error ? CoreHelperUtil.parseError(error) : undefined
    };
  },
  async clearSessions() {
    const siwx = this.getSIWX();

    if (siwx) {
      await siwx.setSessions([]);
    }
  }
};
