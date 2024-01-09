import { Spacing } from '@web3modal/ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    paddingBottom: Spacing['3xl']
  },
  retryButton: {
    marginTop: Spacing.m
  },
  retryIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  textContainer: {
    marginVertical: Spacing.xs
  },
  descriptionText: {
    marginTop: Spacing.xs,
    marginHorizontal: Spacing['3xl']
  }
});
