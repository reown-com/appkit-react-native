import { useSnapshot } from 'valtio';
import { ScrollView, View } from 'react-native';
import {
  ApiController,
  EventUtil,
  EventsController,
  OptionsController,
  RouterController
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import {
  FlexView,
  Icon,
  ListItem,
  Separator,
  Text,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import { Placeholder } from '../../partials/w3m-placeholder';
import { AllWalletsButton } from './components/all-wallets-button';
import { AllWalletList } from './components/all-wallet-list';
import { SocialLoginList } from './components/social-login-list';
import styles from './styles';
import { WcHelpersUtil } from '../../utils/HelpersUtil';

export function ConnectView() {
  const { prefetchError } = useSnapshot(ApiController.state);
  const { features } = useSnapshot(OptionsController.state);
  const { padding } = useCustomDimensions();

  const isSocialEnabled = features?.socials && features?.socials.length > 0;
  const showConnectWalletsButton = isSocialEnabled && !features?.showWallets;
  const showLoadingError = !showConnectWalletsButton && prefetchError;
  const showList = !showConnectWalletsButton && !showLoadingError;

  const onWalletPress = (wallet: WcWallet, isInstalled?: boolean) => {
    const isExternal = WcHelpersUtil.isExternalWallet(wallet);
    if (isExternal) {
      RouterController.push('ConnectingExternal', { wallet });
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet });
    }

    const platform = EventUtil.getWalletPlatform(wallet, isInstalled);
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: wallet.name ?? 'Unknown',
        platform,
        explorer_id: wallet.id
      }
    });
  };

  const onViewAllPress = () => {
    RouterController.push('AllWallets');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_ALL_WALLETS' });
  };

  return (
    <ScrollView style={{ paddingHorizontal: padding }} bounces={false}>
      <FlexView padding={['xs', '0', 's', '0']}>
        {isSocialEnabled ? (
          <>
            <SocialLoginList options={features?.socials} />
            <Separator text="or" style={styles.socialSeparator} />
          </>
        ) : null}

        <FlexView padding={['0', 's', 'xs', 's']}>
          {showConnectWalletsButton ? (
            <ListItem contentStyle={styles.connectWalletButton} onPress={onViewAllPress}>
              <Icon name="wallet" size="lg" />
              <Text variant="paragraph-500">Continue with a wallet</Text>
              <View style={styles.connectWalletEmpty} />
            </ListItem>
          ) : null}
          {showLoadingError ? (
            <FlexView alignItems="center" justifyContent="center" margin={['l', '0', '0', '0']}>
              <Placeholder
                icon="warningCircle"
                iconColor="error-100"
                title="Oops, we couldn’t load the wallets at the moment"
                description={`This might be due to a temporary network issue.\nPlease try reloading to see if that helps.`}
                actionIcon="refresh"
                actionPress={ApiController.prefetch}
                actionTitle="Retry"
              />
              <Separator style={styles.socialSeparator} />
            </FlexView>
          ) : null}
          {showList ? (
            <>
              <AllWalletList itemStyle={styles.item} onWalletPress={onWalletPress} />
              <AllWalletsButton itemStyle={styles.item} onPress={onViewAllPress} />
            </>
          ) : null}
        </FlexView>
      </FlexView>
    </ScrollView>
  );
}
