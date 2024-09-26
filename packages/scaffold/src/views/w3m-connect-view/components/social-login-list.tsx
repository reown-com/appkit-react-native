import { StyleSheet } from 'react-native';
import { FlexView, ListSocial, LogoSelect, Spacing, Text } from '@reown/appkit-ui-react-native';
import type { SocialProvider } from '@reown/appkit-common-react-native';

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

  return (
    <FlexView padding={['xs', 's', '0', 's']}>
      {topSocial && (
        <ListSocial logo={topSocial} disabled={disabled}>
          <Text style={styles.topDescription} color={disabled ? 'fg-300' : 'fg-100'}>
            Continue with{' '}
            <Text style={styles.topSocial} color={disabled ? 'fg-300' : 'fg-100'}>
              {topSocial}
            </Text>
          </Text>
        </ListSocial>
      )}
      <FlexView flexDirection="row" justifyContent="space-between" margin={['xs', '0', '0', '0']}>
        {bottomSocials?.map((social: SocialProvider, index) => (
          <LogoSelect
            key={social}
            disabled={disabled}
            logo={social}
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
  topSocial: {
    textTransform: 'capitalize'
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
