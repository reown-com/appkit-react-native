import { useSnapshot } from 'valtio';
import { RouterController, ModalController } from '@web3modal/core-react-native';
import { IconLink, Text, FlexView, Separator } from '@web3modal/ui-react-native';

export function Header() {
  const { view, history } = useSnapshot(RouterController.state);

  const headings = () => {
    const name = RouterController.state.data?.wallet?.name;
    const networkName = RouterController.state.data?.network?.name;

    return {
      Connect: 'Connect Wallet',
      Account: undefined,
      ConnectingWalletConnect: name ?? 'WalletConnect',
      Networks: 'Choose Network',
      SwitchNetwork: networkName ?? 'Switch Network',
      AllWallets: 'All Wallets',
      WhatIsANetwork: 'What is a Network?',
      WhatIsAWallet: 'What is a Wallet?',
      GetWallet: 'Get a Wallet'
    };
  };

  const header = headings()[view];

  const dynamicButtonTemplate = () => {
    const showBack = history.length > 1;

    return showBack ? (
      <IconLink icon="chevronLeft" size="md" onPress={RouterController.goBack} />
    ) : (
      <IconLink
        icon="helpCircle"
        size="md"
        onPress={() => RouterController.push('WhatIsAWallet')}
      />
    );
  };

  if (!header) return null;

  return (
    <>
      <FlexView
        justifyContent="space-between"
        flexDirection="row"
        alignItems="center"
        padding={['l', 'xl', 'l', 'xl']}
      >
        {dynamicButtonTemplate()}
        <Text variant="paragraph-700" numberOfLines={1}>
          {header}
        </Text>
        <IconLink icon="close" size="md" onPress={ModalController.close} />
      </FlexView>
      <Separator />
    </>
  );
}
