import bs58 from 'bs58';
import nacl from 'tweetnacl';

import { type SIWXSession, SIWXVerifier } from '@reown/appkit-common-react-native';

/**
 * Default verifier for Solana sessions.
 */
export class SolanaVerifier extends SIWXVerifier {
  public readonly chainNamespace = 'solana';

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      const publicKey = bs58.decode(session.data.accountAddress);
      const signature = bs58.decode(session.signature);
      const message = new TextEncoder().encode(session.message.toString());

      const isValid = nacl.sign.detached.verify(message, signature, publicKey);

      return Promise.resolve(isValid);
    } catch (error) {
      return Promise.resolve(false);
    }
  }
}
