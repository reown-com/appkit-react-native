import { StyleSheet } from 'react-native';
import { FlexView, ListSocial, LogoSelect, Spacing, Text } from '@reown/appkit-ui-react-native';
import { type SocialProvider, StringUtil } from '@reown/appkit-common-react-native';
import { RouterController, WebviewController } from '@reown/appkit-core-react-native';

export interface SocialLoginListProps {
  options: readonly SocialProvider[];
  disabled?: boolean;
}

const MAX_OPTIONS = 6;

export function SocialLoginList({ options, disabled }: SocialLoginListProps) {
  const showBigSocial = options?.length > 2 || options?.length === 1;
  const showMoreButton = options?.length > MAX_OPTIONS;
  const topSocial = showBigSocial ? options[0] : null;
  let bottomSocials = showBigSocial ? options.slice(1) : options;
  bottomSocials = showMoreButton ? bottomSocials.slice(0, MAX_OPTIONS - 2) : bottomSocials;

  const onItemPress = (social: SocialProvider) => {
    WebviewController.setConnecting(false);
    if (social === 'farcaster') {
      RouterController.push('ConnectingFarcaster', { socialProvider: social });
    } else {
      RouterController.push('ConnectingSocial', { socialProvider: social });
    }
  };

  const onMorePress = () => {
    RouterController.push('ConnectSocials');
  };

  return (
    <FlexView padding={['xs', 's', '0', 's']}>
      {topSocial && (
        <ListSocial logo={topSocial} disabled={disabled} onPress={() => onItemPress(topSocial)}>
          <Text style={styles.topDescription} color={disabled ? 'fg-300' : 'fg-100'}>
            {`Continue with ${StringUtil.capitalize(topSocial)}`}
          </Text>
        </ListSocial>
      )}
      <FlexView flexDirection="row" justifyContent="space-between" margin={['xs', '0', '0', '0']}>
        {bottomSocials?.map((social: SocialProvider, index) => (
          <LogoSelect
            key={social}
            disabled={disabled}
            logo={social}
            onPress={() => onItemPress(social)}
            style={[
              styles.socialItem,
              index === 0 && styles.socialItemFirst,
              !showMoreButton && index === bottomSocials.length - 1 && styles.socialItemLast
            ]}
          />
        ))}
        {showMoreButton && (
          <LogoSelect
            logo="more"
            disabled={disabled}
            style={[styles.socialItem, styles.socialItemLast]}
            onPress={onMorePress}
          />
        )}
      </FlexView>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  topDescription: {
    textAlign: 'center'
  },
  socialItem: {
    flex: 1,
    marginHorizontal: Spacing['2xs']
  },
  socialItemFirst: {
    marginLeft: 0
  },
  socialItemLast: {
    marginRight: 0
  }
});
