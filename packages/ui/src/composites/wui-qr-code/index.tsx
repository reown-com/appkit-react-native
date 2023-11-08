import { useMemo } from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Shimmer } from '../../components/wui-shimmer';
import { QRCodeUtil } from '../../utils/QRCodeUtil';
import { BorderRadius, LightTheme, Spacing } from '../../utils/ThemeUtil';
import styles from './styles';

export interface QrCodeProps {
  size: number;
  uri?: string;
  imageSrc?: string;
}

export function QrCode({ size, uri, imageSrc }: QrCodeProps) {
  const Theme = LightTheme;
  const containerPadding = Spacing.l;
  const qrSize = size - containerPadding * 2;
  const dots = useMemo(
    () => (uri ? QRCodeUtil.generate(uri, qrSize, qrSize / 4) : []),
    [uri, qrSize]
  );

  const shimmerTemplate = () => {
    return <Shimmer width={size} height={size} borderRadius={BorderRadius.l} />;
  };

  const logoTemplate = () => {
    if (imageSrc) {
      return (
        <Image
          source={imageSrc}
          style={[
            styles.icon,
            { height: qrSize / 4, width: qrSize / 4, borderRadius: qrSize / 16 }
          ]}
        />
      );
    }

    return (
      <Icon
        name="walletConnect"
        color="accent-100"
        height={qrSize / 3.5}
        width={qrSize / 3.5}
        style={styles.icon}
      />
    );
  };

  return uri ? (
    <View
      style={[
        styles.container,
        { height: size, width: size, backgroundColor: Theme['bg-100'], padding: containerPadding }
      ]}
    >
      <Svg height={qrSize} width={qrSize}>
        {dots}
      </Svg>
      {logoTemplate()}
    </View>
  ) : (
    shimmerTemplate()
  );
}
