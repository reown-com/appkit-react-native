import { useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Shimmer } from '../../components/wui-shimmer';
import { Text } from '../../components/wui-text';
import { FlexView } from '../../layout/wui-flex';
import { QRCodeUtil } from '../../utils/QRCodeUtil';
import { BorderRadius, LightTheme, Spacing } from '../../utils/ThemeUtil';
import type { IconType } from '../../utils/TypesUtil';
import styles from './styles';

export interface QrCodeProps {
  size: number;
  uri?: string;
  imageSrc?: string;
  icon?: IconType;
  testID?: string;
  arenaClear?: boolean;
  style?: StyleProp<ViewStyle>;
}

const LABEL_HEIGHT = 18;

export function QrCode({ size, uri, imageSrc, testID, arenaClear, icon, style }: QrCodeProps) {
  const Theme = LightTheme;
  const containerPadding = Spacing.l;
  const qrSize = size - containerPadding * 2;
  const logoSize = arenaClear ? 0 : qrSize / 4;

  const dots = useMemo(
    () => (uri ? QRCodeUtil.generate(uri, qrSize, logoSize) : []),
    [uri, qrSize, logoSize]
  );

  const logoTemplate = () => {
    if (arenaClear) {
      return null;
    }

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
        name={icon ?? 'walletConnect'}
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
        { width: size, backgroundColor: Theme['bg-100'], padding: containerPadding },
        style
      ]}
      testID={testID}
    >
      <FlexView alignItems="center" justifyContent="center">
        <Svg height={qrSize} width={qrSize}>
          {dots}
        </Svg>
        {logoTemplate()}
      </FlexView>
      <Text variant="small-500" color="fg-150" style={[styles.label, { height: LABEL_HEIGHT }]}>
        UX by{' '}
        <Text variant="small-500" color="inverse-000">
          Reown
        </Text>
      </Text>
    </View>
  ) : (
    <Shimmer width={size} height={size + LABEL_HEIGHT} borderRadius={BorderRadius.l} />
  );
}
