import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['3xs'],
    borderRadius: BorderRadius['3xl']
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    gap: Spacing['3xs'],
    paddingVertical: Spacing['2xs']
  },
  activeMark: {
    position: 'absolute',
    height: 30,
    width: 100,
    borderWidth: 1,
    borderRadius: BorderRadius['3xl'],
    margin: Spacing['3xs']
  }
});
