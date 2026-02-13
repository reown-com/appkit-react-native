import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Shimmer } from '../../components/wui-shimmer';
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

  const dotColor = Theme['inverse-000'];
  const edgeColor = Theme['inverse-100'];

  const qrData = useMemo(
    () => (uri ? QRCodeUtil.generate(uri, qrSize, _logoSize, logoBorderRadius) : null),
    [uri, qrSize, _logoSize, logoBorderRadius]
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
        {qrData.rects.map(rect => (
          <Rect
            key={`rect_${rect.x}_${rect.y}`}
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
        {qrData.circles.map(circle => (
          <Circle
            key={`circle_${circle.cx}_${circle.cy}`}
            cx={circle.cx}
            cy={circle.cy}
            fill={dotColor}
            r={circle.r}
          />
        ))}

        {/* Render lines */}
        {qrData.lines.map(line => (
          <Line
            key={`line_${line.x1}_${line.y1}_${line.y2}`}
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
