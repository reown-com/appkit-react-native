import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useAppKitContext } from './useAppKitContext';

/**
 * Hook to access information about the currently connected wallet
 *
 * @remarks
 * This hook provides access to metadata about the connected wallet, such as its name,
 * icon, and other identifying information. It automatically subscribes to wallet info
 * changes via valtio.
 *
 * @returns An object containing:
 *   - `walletInfo`: Metadata about the currently connected wallet (name, icon, etc.)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { walletInfo } = useWalletInfo();
 *
 *   return (
 *     <View>
 *       {walletInfo && (
 *         <>
 *           <Image source={{ uri: walletInfo.icon }} />
 *           <Text>{walletInfo.name}</Text>
 *         </>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 *
 * @throws {Error} If used outside of an AppKitProvider
 */
export function useWalletInfo() {
  useAppKitContext();
  const { walletInfo: walletInfoSnapshot } = useSnapshot(ConnectionsController.state);

  const walletInfo = useMemo(() => ({ walletInfo: walletInfoSnapshot }), [walletInfoSnapshot]);

  return walletInfo;
}
