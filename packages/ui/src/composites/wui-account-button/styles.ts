import { StyleSheet } from 'react-native';
import { Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xs']
  },
  image: {
    height: 24,
    width: 24,
    borderRadius: 100,
    borderWidth: 2
  },
  avatarPlaceholder: {
    borderWidth: 0
  },
  networkContainer: {
    flexDirection: 'row',
    height: 32,
    paddingLeft: Spacing['3xs'],
    paddingRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addressContainer: {
    flexDirection: 'row',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: Spacing['3xs'],
    paddingRight: Spacing.xs,
    borderRadius: 100,
    borderWidth: 1
  },
  address: {
    marginLeft: Spacing['3xs']
  },
  balance: {
    marginLeft: Spacing['3xs']
  }
});
