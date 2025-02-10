import { RouterController, type OnRampCountry } from '@reown/appkit-core-react-native';
import { IconLink, Spacing, Text } from '@reown/appkit-ui-react-native';

import { FlexView } from '@reown/appkit-ui-react-native';
import { SelectButton } from './SelectButton';
import { StyleSheet, View } from 'react-native';

export interface HeaderProps {
  selectedCountry?: OnRampCountry;
  onCountryPress: () => void;
}

export function Header({ selectedCountry, onCountryPress }: HeaderProps) {
  const handleGoBack = () => {
    RouterController.goBack();
  };

  return (
    <FlexView
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      padding={['l', 'xl', 'l', 'xl']}
    >
      <IconLink
        style={styles.backButton}
        icon="chevronLeft"
        size="md"
        onPress={handleGoBack}
        testID="button-back"
      />
      <Text variant="paragraph-600" numberOfLines={1} testID="header-text">
        Buy crypto
      </Text>
      <View style={styles.countryContainer}>
        <SelectButton
          style={styles.countryButton}
          onPress={onCountryPress}
          imageURL={selectedCountry?.flagImageUrl}
          imageStyle={styles.flagImage}
          isSVG
        />
      </View>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'flex-start',
    width: 70
  },
  countryContainer: {
    width: 70
  },
  countryButton: {
    marginLeft: Spacing.xs
  },
  flagImage: {
    height: 16
  }
});
