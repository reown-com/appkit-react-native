import { memo, useEffect, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Shimmer } from '../../components/wui-shimmer';
import { QRCodeUtil, type QRData } from '../../utils/QRCodeUtil';
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
  logoSize?: number;
  logoBorderRadius?: number;
}

export function QrCode_({
  size,
  uri,
  imageSrc,
  testID,
  arenaClear,
  icon,
  style,
  logoSize,
  logoBorderRadius
}: QrCodeProps) {
  const Theme = LightTheme;
  const containerPadding = Spacing.l;
  const qrSize = size - containerPadding * 2;
  const _logoSize = arenaClear ? 0 : logoSize ?? qrSize / 4;

  const [qrData, setQrData] = useState<QRData | null>(null);

  const dotColor = Theme['inverse-000'];
  const edgeColor = Theme['inverse-100'];

  useEffect(() => {
    if (!uri) {
      setQrData(null);

      return;
    }

    let cancelled = false;

    // Run QR generation asynchronously
    QRCodeUtil.generateAsync(uri, qrSize, _logoSize, logoBorderRadius)
      .then(data => {
        if (!cancelled) {
          setQrData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrData(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uri, qrSize, _logoSize, logoBorderRadius]);

  const logoTemplate = () => {
    if (arenaClear) {
      return null;
    }

    if (imageSrc) {
      return (
        <Image
          source={imageSrc}
          style={[
            {
              position: 'absolute' as const,
              height: _logoSize,
              width: _logoSize,
              borderRadius: logoBorderRadius
            }
          ]}
        />
      );
    }

    return (
      <Icon
        name={icon ?? 'walletConnect'}
        color="accent-100"
        height={_logoSize}
        width={_logoSize}
        style={{ position: 'absolute' as const }}
      />
    );
  };

  if (!uri || !qrData) {
    return <Shimmer width={size} height={size} borderRadius={BorderRadius.l} />;
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, backgroundColor: Theme['inverse-100'], padding: containerPadding },
        style
      ]}
      testID={testID}
    >
      <Svg height={qrSize} width={qrSize}>
        {/* Render rectangles */}
        {qrData.rects.map((rect, idx) => (
          <Rect
            key={`rect_${idx}`}
            fill={rect.fillType === 'dot' ? dotColor : edgeColor}
            height={rect.size}
            rx={rect.size * 0.32}
            ry={rect.size * 0.32}
            width={rect.size}
            x={rect.x}
            y={rect.y}
          />
        ))}

        {/* Render circles */}
        {qrData.circles.map((circle, idx) => (
          <Circle
            key={`circle_${idx}`}
            cx={circle.cx}
            cy={circle.cy}
            fill={dotColor}
            r={circle.r}
          />
        ))}

        {/* Render lines */}
        {qrData.lines.map((line, idx) => (
          <Line
            key={`line_${idx}`}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
            stroke={dotColor}
            strokeWidth={line.strokeWidth}
            strokeLinecap="round"
          />
        ))}
      </Svg>
      {logoTemplate()}
    </View>
  );
}

export const QrCode = memo(QrCode_, (prevProps, nextProps) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.uri === nextProps.uri &&
    prevProps.style === nextProps.style &&
    prevProps.logoBorderRadius === nextProps.logoBorderRadius
  );
});
