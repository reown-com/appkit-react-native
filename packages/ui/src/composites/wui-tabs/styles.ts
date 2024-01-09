import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export default StyleSheet.create({
  container: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xs'],
    borderRadius: BorderRadius['3xl']
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    paddingVertical: Spacing['2xs']
  },
  tabIcon: {
    marginRight: Spacing['3xs']
  },
  activeMark: {
    position: 'absolute',
    height: 28,
    width: 100,
    borderWidth: 1,
    borderRadius: BorderRadius['3xl'],
    margin: Spacing['3xs']
  }
});
