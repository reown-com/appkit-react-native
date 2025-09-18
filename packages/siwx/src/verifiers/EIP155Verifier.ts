import { isValidEip191Signature } from '@walletconnect/utils';
import { type SIWXSession, SIWXVerifier } from '@reown/appkit-common-react-native';

/**
 * Default verifier for EIP155 sessions.
 */
export class EIP155Verifier extends SIWXVerifier {
  public readonly chainNamespace = 'eip155';

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      return await isValidEip191Signature(
        session.data.accountAddress,
        session.message.toString(),
        session.signature
      );
    } catch (error) {
      return false;
    }
  }
}
