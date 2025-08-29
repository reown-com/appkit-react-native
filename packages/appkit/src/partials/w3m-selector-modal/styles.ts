import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    paddingTop: Spacing['2xs'],
    paddingBottom: Spacing.s
  },
  headerTop: {
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xs
  },
  container: {
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l
  },
  listContent: {
    paddingTop: Spacing.s
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
    marginVertical: Spacing.xs
  }
});
