import { Platform } from 'react-native';
import { useSnapshot } from 'valtio';
import { FlexView, Spacing } from '@reown/appkit-ui-react-native';
import { ConnectEmailInput } from '../w3m-connect-view/components/connect-email-input';
import { SocialLoginList } from '../w3m-connect-view/components/social-login-list';
import { WalletGuide } from '../w3m-connect-view/components/wallet-guide';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectorController, OptionsController } from '@reown/appkit-core-react-native';
import { useKeyboard } from '../../hooks/useKeyboard';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

export function CreateView() {
  const connectors = ConnectorController.state.connectors;
  const { authLoading } = useSnapshot(ConnectorController.state);
  const { features } = useSnapshot(OptionsController.state);
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const isAuthEnabled = connectors.some(c => c.type === 'AUTH');
  const isEmailEnabled = isAuthEnabled && features?.email;
  const isSocialEnabled = isAuthEnabled && features?.socials && features?.socials.length > 0;

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing.xl : Spacing.xl,
    default: Spacing.xl
  });

  return (
    <BottomSheetScrollView style={{ paddingHorizontal: padding }} bounces={false}>
      <FlexView padding={['xs', '0', '0', '0']} style={{ paddingBottom }}>
        {isEmailEnabled && <ConnectEmailInput loading={authLoading} />}
        {isSocialEnabled && <SocialLoginList options={features?.socials} disabled={authLoading} />}
        {isAuthEnabled && <WalletGuide guide="explore" />}
      </FlexView>
    </BottomSheetScrollView>
  );
}
