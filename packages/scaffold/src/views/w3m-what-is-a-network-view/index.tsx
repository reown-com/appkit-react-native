import { Linking, ScrollView } from 'react-native';
import { Button, FlexView, Text, Visual } from '@web3modal/ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function WhatIsNetworkView() {
  const { padding } = useCustomDimensions();
  const onLearnMorePress = () => {
    Linking.openURL('https://ethereum.org/en/developers/docs/networks/');
  };

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
      <FlexView alignItems="center" padding={['l', '4xl', '3xl', '4xl']}>
        <FlexView flexDirection="row" padding={['0', '0', 'xs', '0']}>
          <Visual name="network" />
          <Visual name="layers" style={styles.visual} />
          <Visual name="system" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          The system’s nuts and bolts
        </Text>
        <Text variant="small-500" color="fg-200" center>
          A network is what brings the blockchain to life, as this technical infrastructure allows
          apps to access the ledger and smart contract services.
        </Text>
        <FlexView flexDirection="row" padding={['3xl', '0', 'xs', '0']}>
          <Visual name="noun" />
          <Visual name="defiAlt" style={styles.visual} />
          <Visual name="dao" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          Designed for different uses
        </Text>
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
