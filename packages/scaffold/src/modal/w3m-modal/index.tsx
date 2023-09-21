import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import Modal from 'react-native-modal';
import { Card } from '@web3modal/ui-react-native';
import { ApiController, ModalController } from '@web3modal/core-react-native';

import { Web3Router } from '../w3m-router';
import styles from './styles';
import { Header } from '../../partials/w3m-header';

export function Web3Modal() {
  const { open } = useSnapshot(ModalController.state);

  useEffect(() => {
    ApiController.prefetch();
  }, []);

  return (
    <Modal style={styles.modal} isVisible={open} >
      <Card style={styles.card}>
        <Header />
        <Web3Router />
        {/* <Snack /> */}
      </Card>
    </Modal>
  );
};
