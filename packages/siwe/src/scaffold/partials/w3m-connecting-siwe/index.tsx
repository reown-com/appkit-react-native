import { useSnapshot } from 'valtio';
import { Animated, useAnimatedValue, type StyleProp, type ViewStyle } from 'react-native';
import {
  AccountController,
  AssetUtil,
  ConnectionController,
  OptionsController
} from '@reown/appkit-core-react-native';
import {
  FlexView,
  Icon,
  Image,
  WalletImage,
  useTheme,
  Avatar
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import { useEffect } from 'react';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function ConnectingSiwe({ style }: Props) {
  const Theme = useTheme();
  const { metadata } = useSnapshot(OptionsController.state);
  const { connectedWalletImageUrl, pressedWallet } = useSnapshot(ConnectionController.state);
  const { address, profileName, profileImage } = useSnapshot(AccountController.state);
  const dappIcon = metadata?.icons[0] || '';
  const dappPosition = useAnimatedValue(10);
  const walletPosition = useAnimatedValue(-10);
  const walletIcon = AssetUtil.getWalletImage(pressedWallet) || connectedWalletImageUrl;

  const animateDapp = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dappPosition, {
          toValue: -5,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(dappPosition, {
          toValue: 10,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const animateWallet = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(walletPosition, {
          toValue: 5,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(walletPosition, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  useEffect(() => {
    animateDapp();
    animateWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlexView flexDirection="row" alignItems="center" justifyContent="center" style={style}>
      <Animated.View
        style={[
          styles.iconBorder,
          styles.dappBorder,
          {
            transform: [{ translateX: dappPosition }],
            backgroundColor: Theme['bg-200']
          }
        ]}
      >
        {dappIcon ? (
          <Image
            source={dappIcon}
            style={[styles.dappIcon, { backgroundColor: Theme['bg-200'] }]}
          />
        ) : (
          <Icon name="mobile" size="lg" color="fg-200" />
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.iconBorder,
          styles.walletBorder,
          !walletIcon && styles.walletAvatar,
          {
            transform: [{ translateX: walletPosition }],
            backgroundColor: Theme['bg-200']
          }
        ]}
      >
        {walletIcon ? (
          <WalletImage imageSrc={walletIcon} size="lg" border={false} />
        ) : (
          <Avatar
            imageSrc={profileImage}
            address={profileName ?? address}
            size={60}
            borderWidth={0}
          />
        )}
      </Animated.View>
    </FlexView>
  );
}
