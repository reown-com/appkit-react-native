import { generateRandomBytes32 } from '@walletconnect/utils';
import {
  createSIWEConfig,
  formatMessage,
  type SIWEVerifyMessageArgs,
  type SIWECreateMessageArgs
} from '@web3modal/siwe-react-native';
import { chains } from './WagmiUtils';

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: false,
  signOutOnNetworkChange: false,
  // We don't require any async action to populate params but other apps might

  getMessageParams: async () => {
    // Parameters to create the SIWE message internally.
    // More info in https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-222.method

    return {
      domain: 'com.walletconnect.web3modal.rnsample', //your bundle id or app id
      uri: 'redirect://', // your redirect uri
      chains: chains.map(chain => chain.id),
      statement: 'Please sign with your account',
      iat: new Date().toISOString()
    };
  },
  createMessage: ({ address, ...args }: SIWECreateMessageArgs): string => {
    // Method for generating an EIP-4361-compatible message.
    return formatMessage(args, address);
  },
  getNonce: async (): Promise<string> => {
    // The getNonce method functions as a safeguard
    // against spoofing, akin to a CSRF token.

    const nonce = generateRandomBytes32();

    return nonce;
  },
  getSession: async () => {
    // The backend session should store the associated address and chainId
    // and return it via the `getSession` method.

    return Promise.resolve({
      address: '0x',
      chainId: 1
    });
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyMessage: async ({ message, signature, cacao }: SIWEVerifyMessageArgs): Promise<boolean> => {
    // This function ensures the message is valid,
    // has not been tampered with, and has been appropriately
    // signed by the wallet address.

    return true;
  },
  signOut: async (): Promise<boolean> => {
    // The users session must be destroyed when calling `signOut`.

    try {
      return await Promise.resolve(true);
    } catch (error) {
      return false;
    }
  }
});
