import { useMemo } from 'react';
import { Svg } from 'react-native-svg';
import { View, Image, StyleSheet } from 'react-native';
import { QRCodeUtil } from '../utils/QRCodeUtil';
import WCIsotype from '../assets/WCIsotype.png';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  uri: string;
  size: number;
  theme?: 'light' | 'dark';
}

function QRCode({ uri, size, theme = 'light' }: Props) {
  const tintColor = theme === 'light' ? LightTheme.accent : DarkTheme.accent;
  const dots = useMemo(
    () => QRCodeUtil.generate(uri, size, size / 4, theme),
    [uri, size, theme]
  );

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        {dots}
      </Svg>
      <Image
        source={WCIsotype}
        resizeMode="contain"
        style={[styles.logo, { width: size / 4, tintColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
  },
});

export default QRCode;
