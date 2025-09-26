import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  contentContainer: {
    padding: Spacing.s,
    paddingBottom: Spacing['s']
  },
  header: {
    marginBottom: Spacing.s
  },
  networkItem: {
    marginVertical: Spacing['3xs']
  },
  networkItemContent: {
    justifyContent: 'space-between'
  },
  separator: {
    marginBottom: Spacing['2xs']
  }
});
