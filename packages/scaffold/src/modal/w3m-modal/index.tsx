import { Card, Overlay } from '@web3modal/ui-react-native';
import { Web3Router } from '../w3m-router';

export interface Web3ModalProps {

}

export function Web3Modal({ }: Web3ModalProps) {
  return (
    <Overlay>
      <Card>
        <Web3Router />
      </Card>
    </Overlay>
  );
};
