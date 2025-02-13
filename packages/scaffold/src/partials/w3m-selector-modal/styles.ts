import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    marginBottom: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
