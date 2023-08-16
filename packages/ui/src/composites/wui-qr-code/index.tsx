import { useMemo } from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { QRCodeUtil } from '../../utils/QRCodeUtil';
import { LightTheme } from '../../utils/ThemeUtil';
import styles from './styles';

export interface QrCodeProps {
  size: number;
  uri: string;
  imageSrc?: string;
}

export function QrCode({ size, uri, imageSrc }: QrCodeProps) {
  const Theme = LightTheme;

  const dots = useMemo(() => (uri ? QRCodeUtil.generate(uri, size, size / 4) : []), [uri, size]);

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-100'] }]}>
      <Svg height={size} width={size}>
        {dots}
      </Svg>
      {imageSrc ? (
        <Image
          source={imageSrc}
          style={[styles.icon, { height: size / 4, width: size / 4, borderRadius: size / 16 }]}
        />
      ) : (
        <Icon
          name="walletConnect"
          color="blue-100"
          height={size / 3}
          width={size / 3}
          style={styles.icon}
        />
      )}
    </View>
  );
}
