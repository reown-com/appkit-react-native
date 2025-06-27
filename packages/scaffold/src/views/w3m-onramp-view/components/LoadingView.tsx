import { FlexView, Text, Shimmer } from '@reown/appkit-ui-react-native';
import { Dimensions, ScrollView } from 'react-native';
import { Header } from './Header';
import styles from '../styles';

export function LoadingView() {
  const windowWidth = Dimensions.get('window').width;

  return (
    <>
      <Header onSettingsPress={() => {}} />
      <ScrollView bounces={false} testID="onramp-loading-view">
        <FlexView padding={['s', 'l', '4xl', 'l']}>
          <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="small-400" color="fg-150">
              You Buy
            </Text>
            <Shimmer width={100} height={40} borderRadius={20} />
          </FlexView>

          {/* Currency Input Area */}
          <FlexView margin={['m', '0', 'm', '0']}>
            <Shimmer width="100%" height={323} borderRadius={16} />
          </FlexView>

          {/* Payment Method Button */}
          <Shimmer width="100%" height={64} borderRadius={16} style={styles.paymentButtonMock} />

          {/* Action Buttons */}
          <FlexView
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            margin={['m', '0', '0', '0']}
          >
            <Shimmer width={windowWidth * 0.2} height={48} borderRadius={16} />
            <Shimmer width={windowWidth * 0.68} height={48} borderRadius={16} />
          </FlexView>
        </FlexView>
      </ScrollView>
    </>
  );
}
