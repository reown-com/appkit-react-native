import { StyleSheet } from 'react-native';
import { Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    paddingBottom: Spacing['3xl']
  },
  backButton: {
    alignSelf: 'flex-start'
  },
  imageContainer: {
    marginBottom: Spacing.s
  },
  retryButton: {
    marginTop: Spacing.m
  },
  retryIcon: {
    transform: [{ rotateY: '180deg' }]
  },
  errorText: {
    marginHorizontal: Spacing['4xl']
  }
});
