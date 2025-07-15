import { useSnapshot } from 'valtio';
import { ScrollView } from 'react-native';
import { StringUtil, type SocialProvider } from '@reown/appkit-common-react-native';
import {
  EventsController,
  OptionsController,
  RouterController
} from '@reown/appkit-core-react-native';
import { FlexView, ListSocial, Text } from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectSocialsView() {
  const { features } = useSnapshot(OptionsController.state);
  const { padding } = useCustomDimensions();
  const socialProviders = (features?.socials ?? []) as SocialProvider[];

  const onItemPress = (provider: SocialProvider) => {
    EventsController.sendEvent({
      type: 'track',
      event: 'SOCIAL_LOGIN_STARTED',
      properties: { provider }
    });

    RouterController.push('ConnectingSocial', { socialProvider: provider });
  };

  return (
    <ScrollView style={{ paddingHorizontal: padding }} bounces={false}>
      <FlexView padding={['xs', 'm', '2xl', 'm']}>
        {socialProviders.map(provider => (
          <ListSocial
            key={provider}
            logo={provider}
            onPress={() => onItemPress(provider)}
            style={styles.item}
          >
            <Text style={styles.text} color={'fg-100'}>
              {StringUtil.capitalize(provider)}
            </Text>
          </ListSocial>
        ))}
      </FlexView>
    </ScrollView>
  );
}
