import { Linking, ScrollView } from 'react-native';
import { Button, FlexView, Text, Visual } from '@web3modal/ui-react-native';
import { useViewWidth } from '../../hooks/useViewWidth';
import styles from './styles';

export function WhatIsNetworkView() {
  const { width } = useViewWidth();
  const onLearnMorePress = () => {
    Linking.openURL('https://ethereum.org/en/developers/docs/networks/');
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      bounces={false}
      fadingEdgeLength={20}
      style={[styles.container, { width }]}
    >
      <FlexView alignItems="center" rowGap="xs" padding={['l', '4xl', '2xl', '4xl']}>
        <FlexView flexDirection="row" columnGap="s" padding={['0', '0', 'xs', '0']}>
          <Visual name="network" />
          <Visual name="layers" />
          <Visual name="system" />
        </FlexView>
        <Text variant="paragraph-500">The system’s nuts and bolts</Text>
        <Text variant="small-500" color="fg-200" center>
          A network is what brings the blockchain to life, as this technical infrastructure allows
          apps to access the ledger and smart contract services.
        </Text>
        <FlexView flexDirection="row" columnGap="s" padding={['2xl', '0', 'xs', '0']}>
          <Visual name="noun" />
          <Visual name="defiAlt" />
          <Visual name="dao" />
        </FlexView>
        <Text variant="paragraph-500">Designed for different uses</Text>
        <Text variant="small-500" color="fg-200" center>
          Each network is designed differently, and may therefore suit certain apps and experiences.
        </Text>
        <Button
          size="sm"
          iconRight="externalLink"
          style={styles.learnButton}
          onPress={onLearnMorePress}
        >
          Learn more
        </Button>
      </FlexView>
    </ScrollView>
  );
}
