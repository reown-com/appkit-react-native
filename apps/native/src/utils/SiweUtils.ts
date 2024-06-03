import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs } from '@web3modal/siwe-react-native';
import { createSIWEConfig, formatMessage } from '@web3modal/siwe-react-native';
import { chains } from './WagmiUtils';

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: false,
  signOutOnNetworkChange: false,
  // We don't require any async action to populate params but other apps might

  getMessageParams: async () => ({
    domain: 'web3modal',
    uri: 'com.walletconnect.web3modal.rnsample',
    chains: chains.map(chain => chain.id),
    statement: 'Please sign with your account',
    iat: new Date().toISOString()
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
  getNonce: async () => {
    // const nonce = await fetch('http://localhost:3000/nonce').then(res => {
    //   return res.text();
    // });
    //generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();

    if (!nonce) {
      throw new Error('Failed to get nonce!');
    }

    return nonce;
  },
  getSession: async () => {
    // const session = await getSession();
    // if (!session) {
    //   throw new Error('Failed to get session!');
    // }

    // const { address, chainId } = session as unknown as SIWESession;

    return Promise.resolve({
      address: '0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689',
      chainId: 1
    });
    // return Promise.resolve(undefined);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyMessage: async ({ message, signature, cacao }: SIWEVerifyMessageArgs) => {
    try {
      /*
       * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
       * When personal_sign fallback is used, cacao will be undefined
       */
      if (cacao) {
        // Do something
      }
      // const success = await fetch('http://localhost:3000/verify', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     message,
      //     signature
      //   })
      // });

      return true;
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      Promise.resolve({
        redirect: false
      });

      return true;
    } catch (error) {
      return false;
    }
  }
});
