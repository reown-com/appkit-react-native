import { StyleSheet } from 'react-native';
import { Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.l
  },
  content: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.l,
    position: 'absolute',
    width: '100%'
  },
  contentWrapper: {
    overflow: 'hidden'
  }
});
