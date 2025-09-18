// import { Verifier } from 'bip322-js';

// import { type SIWXSession, SIWXVerifier } from '@reown/appkit-common-react-native';

// /**
//  * Default verifier for BIP122 sessions.
//  */
// export class BIP122Verifier extends SIWXVerifier {
//   public readonly chainNamespace = 'bip122';

//   public async verify(session: SIWXSession): Promise<boolean> {
//     try {
//       return Promise.resolve(
//         Verifier.verifySignature(session.data.accountAddress, session.message, session.signature)
//       );
//     } catch (error) {
//       return false;
//     }
//   }
// }
