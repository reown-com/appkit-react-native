import {
  BorderRadius,
  FlexView,
  Icon,
  Image,
  LoadingSpinner,
  Pressable,
  Spacing,
  Text,
  useTheme
} from '@reown/appkit-ui-react-native';
import { StyleSheet, View } from 'react-native';

interface PaymentButtonProps {
  disabled?: boolean;
  loading?: boolean;
  title: string;
  subtitle?: string;
  paymentLogo?: string;
  providerLogo?: string;
  onPress: () => void;
  testID?: string;
}

function PaymentButton({
  disabled,
  loading,
  title,
  subtitle,
  paymentLogo,
  providerLogo,
  onPress,
  testID
}: PaymentButtonProps) {
  const Theme = useTheme();
  const backgroundColor = Theme['gray-glass-005'];

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={styles.pressable}
      testID={testID}
    >
      <FlexView
        style={[styles.container, { backgroundColor }]}
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
      >
        <FlexView
          alignItems="center"
          justifyContent="center"
          style={[styles.iconContainer, { backgroundColor: Theme['bg-300'] }]}
        >
          {paymentLogo ? (
            <Image
              source={paymentLogo}
              style={styles.paymentLogo}
              resizeMethod="resize"
              resizeMode="contain"
            />
          ) : (
            <Icon name="card" size="lg" />
          )}
        </FlexView>
        <FlexView
          flexGrow={1}
          flexDirection="column"
          alignItems="flex-start"
          margin={['0', '0', '0', 's']}
        >
          <Text variant="paragraph-400" color="fg-100">
            {title}
          </Text>
          {subtitle && (
            <FlexView flexDirection="row" alignItems="center" margin={['4xs', '0', '0', '0']}>
              {providerLogo && (
                <>
                  <Text variant="small-400" color="fg-150">
                    via
                  </Text>
                  <Image
                    source={providerLogo}
                    style={styles.providerLogo}
                    resizeMethod="resize"
                    resizeMode="contain"
                  />
                </>
              )}
              <Text variant="small-400" color="fg-150">
                {subtitle}
              </Text>
            </FlexView>
          )}
        </FlexView>
        {loading ? (
          <LoadingSpinner size="md" color="fg-200" style={styles.rightIcon} />
        ) : disabled ? (
          <View />
        ) : (
          <Icon name="chevronRight" size="md" color="fg-200" style={styles.rightIcon} />
        )}
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: BorderRadius.xs
  },
  container: {
    padding: Spacing.s,
    borderRadius: BorderRadius.xs
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius['3xs']
  },
  paymentLogo: {
    height: 24,
    width: 24
  },
  providerLogo: {
    height: 16,
    width: 16,
    marginHorizontal: Spacing['4xs'],
    borderRadius: BorderRadius['5xs']
  },
  rightIcon: {
    marginRight: Spacing.xs
  }
});

export default PaymentButton;
