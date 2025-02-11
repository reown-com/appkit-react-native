import {
  BorderRadius,
  FlexView,
  Icon,
  Image,
  Pressable,
  Shimmer,
  Spacing,
  Text,
  useTheme,
  type IconType
} from '@reown/appkit-ui-react-native';
import type { ImageStyle, StyleProp } from 'react-native';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface Props {
  text?: string;
  description?: string;
  isError?: boolean;
  loading?: boolean;
  tagText?: string;
  onPress: () => void;
  imageURL?: string;
  isSVG?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  imageContainerStyle?: StyleProp<ViewStyle>;
  iconPlaceholder?: IconType;
  pressable?: boolean;
  loadingHeight?: number; //TODO: review this
  pressableIcon?: IconType;
}

export function SelectButton({
  text,
  description,
  isError,
  loading,
  loadingHeight,
  onPress,
  imageURL,
  isSVG,
  style,
  imageStyle,
  imageContainerStyle,
  iconPlaceholder = 'coinPlaceholder',
  pressable = true,
  pressableIcon = 'chevronBottom'
}: Props) {
  const Theme = useTheme();

  return loading ? (
    <Shimmer
      height={loadingHeight}
      width="100%"
      borderRadius={BorderRadius.xs}
      style={[styles.container, style]}
    />
  ) : (
    <Pressable
      onPress={pressable ? onPress : undefined}
      style={[
        styles.container,
        {
          borderColor: Theme['gray-glass-010'],
          backgroundColor: Theme['gray-glass-005']
        },
        style
      ]}
    >
      <FlexView flexDirection="row" alignItems="center">
        <FlexView style={imageContainerStyle}>
          {imageURL ? (
            isSVG ? (
              <SvgUri uri={imageURL} style={[styles.image, imageStyle]} />
            ) : (
              <Image source={imageURL} style={[styles.image, imageStyle]} />
            )
          ) : (
            !text && <Icon name={iconPlaceholder} size="sm" color="fg-150" style={styles.image} />
          )}
        </FlexView>
        {(text || description) && (
          <FlexView flexDirection="column" alignItems="flex-start" style={styles.textContainer}>
            {text && <Text>{text}</Text>}
            {description && (
              <Text
                variant="small-400"
                color={isError ? 'error-100' : 'fg-100'}
                style={!!text && styles.description}
              >
                {description}
              </Text>
            )}
          </FlexView>
        )}
      </FlexView>
      {pressable && <Icon name={pressableIcon} style={styles.chevron} size="xxs" color="fg-150" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.s
  },
  image: {
    width: 20,
    height: 20
  },
  textContainer: {
    marginLeft: Spacing.s
  },
  description: {
    marginTop: Spacing['3xs']
  },
  chevron: {
    marginLeft: Spacing.xs
  }
});
