import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  BorderRadius,
  FlexView,
  Icon,
  IconBox,
  Spacing,
  Text,
  useTheme,
  useAnimatedValue
} from '@web3modal/ui-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface Props {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function UpgradeWalletButton({ style, onPress }: Props) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['accent-glass-010'],
    Theme['accent-glass-020']
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      style={[styles.container, { backgroundColor: animatedValue }, style]}
    >
      <IconBox icon="wallet" size="lg" background iconColor="accent-100" />
      <FlexView flexGrow={1} margin={['0', 'm', '0', 'm']}>
        <Text color="fg-100">Upgrade your wallet</Text>
        <Text variant="small-400" color="fg-200">
          Transition to a self-custodial wallet
        </Text>
      </FlexView>
      <Icon name="chevronRight" size="sm" color="fg-200" style={styles.chevron} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 75,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.s
  },
  textContainer: {
    marginHorizontal: Spacing.m
  },
  chevron: {
    marginRight: Spacing['2xs']
  }
});
