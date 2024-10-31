import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    height: 44,
    minWidth: 160,
    maxWidth: 260,
    paddingLeft: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth
  },
  text: {
    marginLeft: Spacing['2xs']
  },
  copyButton: {
    marginHorizontal: Spacing['3xs']
  }
});
