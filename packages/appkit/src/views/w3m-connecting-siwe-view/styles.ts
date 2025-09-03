import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    minHeight: '30%'
  },
  logoContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.m
  },
  button: {
    width: '48%'
  },
  title: {
    marginHorizontal: '15%'
  },
  subtitle: {
    marginHorizontal: '10%',
    marginVertical: Spacing.l
  },
  walletAvatar: {
    borderRadius: BorderRadius.full
  }
});
