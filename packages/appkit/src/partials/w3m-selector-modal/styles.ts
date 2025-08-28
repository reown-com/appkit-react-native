import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    marginBottom: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  container: {
    height: '100%',
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
  networkImage: {
    height: 20,
    width: 20,
    borderRadius: BorderRadius.full
  },
  searchBar: {
    marginBottom: Spacing.s,
    marginHorizontal: Spacing.s
  },
  separator: {
    marginTop: Spacing.m
  }
});
