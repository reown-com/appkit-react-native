import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 400
  },
  balanceText: {
    fontSize: 40,
    fontWeight: '500'
  },
  actionsContainer: {
    width: '100%',
    marginTop: Spacing.s,
    marginBottom: Spacing.l
  },
  action: {
    flex: 1,
    height: 52
  },
  actionLeft: {
    marginRight: 8
  },
  actionRight: {
    marginLeft: 8
  },
  tab: {
    width: '100%',
    paddingHorizontal: Spacing.s
  },
  tabContainer: {
    flex: 1,
    width: '100%'
  },
  tabContent: {
    paddingHorizontal: Spacing.m
  }
});
