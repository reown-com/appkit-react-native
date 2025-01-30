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
  iconPlaceholder?: IconType;
  pressable?: boolean;
  loadingHeight?: number; //TODO: review this
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
  iconPlaceholder = 'coinPlaceholder',
  pressable = true
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
        {imageURL ? (
          isSVG ? (
            <SvgUri uri={imageURL} style={[styles.image, imageStyle]} />
          ) : (
            <Image source={imageURL} style={[styles.image, imageStyle]} />
          )
        ) : (
          !text && <Icon name={iconPlaceholder} size="sm" color="fg-150" style={styles.image} />
        )}
        {(text || description) && (
          <FlexView flexDirection="column" alignItems="flex-start" style={styles.textContainer}>
            {text && <Text>{text}</Text>}
            {description && (
              <Text
                variant="small-400"
                color={isError ? 'error-100' : 'fg-100'}
                style={styles.description}
              >
                {description}
              </Text>
            )}
          </FlexView>
        )}
      </FlexView>
      {pressable && <Icon name="chevronBottom" size="xxs" color="fg-150" />}
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
    height: 20,
    marginRight: Spacing.xs
  },
  textContainer: {
    marginLeft: Spacing.xs
  },
  description: {
    marginTop: Spacing['3xs']
  }
});
