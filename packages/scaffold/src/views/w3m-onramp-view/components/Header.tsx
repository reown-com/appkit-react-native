import { RouterController } from '@reown/appkit-core-react-native';
import { IconLink, Text } from '@reown/appkit-ui-react-native';
import { FlexView } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

interface HeaderProps {
  onSettingsPress: () => void;
}

export function Header({ onSettingsPress }: HeaderProps) {
  const handleGoBack = () => {
    RouterController.goBack();
  };

  return (
    <FlexView justifyContent="space-between" flexDirection="row" alignItems="center" padding="l">
      <IconLink
        icon="chevronLeft"
        size="md"
        onPress={handleGoBack}
        testID="button-back"
        style={styles.icon}
      />
      <Text variant="paragraph-600" numberOfLines={1} testID="header-text">
        Buy crypto
      </Text>
      <IconLink
        icon="settings"
        size="lg"
        onPress={onSettingsPress}
        style={styles.icon}
        testID="button-onramp-settings"
      />
    </FlexView>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 40,
    width: 40
  }
});
