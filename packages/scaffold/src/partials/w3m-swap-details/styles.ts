import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16
  },
  titlePrice: {
    marginLeft: Spacing['3xs']
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: BorderRadius.xxs,
    marginTop: Spacing['2xs']
  }
});
