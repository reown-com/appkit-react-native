import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  header: {
    marginBottom: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  container: {
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    paddingTop: Spacing.m
  },
  selectedContainer: {
    paddingHorizontal: Spacing.m
  },
  listContent: {
    paddingTop: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  },
  searchBar: {
    marginBottom: Spacing.s,
    marginHorizontal: Spacing.s
  },
  separator: {
    marginTop: Spacing.m
  }
});
