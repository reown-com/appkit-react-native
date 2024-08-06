import { BorderRadius } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  dappIcon: {
    height: 64,
    width: 64,
    borderRadius: BorderRadius.full
  },
  iconBorder: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dappBorder: {
    borderRadius: BorderRadius.full,
    zIndex: 2
  },
  walletBorder: {
    borderRadius: 22,
    width: 72,
    height: 72
  },
  walletAvatar: {
    borderRadius: BorderRadius.full
  }
});
