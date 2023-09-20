import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import {RouterController} from '@web3modal/core-react-native'


import { View } from 'react-native';
import { ConnectView } from '../../views/w3m-connect-view';

interface Props {
  // onCopyClipboard?: (value: string) => void;
}

export function Web3Router(props: Props) {
  const routerState = useSnapshot(RouterController.state);

  const ViewComponent = useMemo(() => {
    switch (routerState.view) {
      case 'Connect':
        return ConnectView;
      case 'Account':
        return View;
      default:
        return View;
    }
  }, [routerState.view]);

  return (

      <ViewComponent
        {...props}
      />

  );
}
