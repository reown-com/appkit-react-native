import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@reown/appkit-ui-react-native';

export default StyleSheet.create({
  container: {
    borderRadius: BorderRadius.l,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 0
  },
  title: {
    paddingTop: Spacing['2xs']
  },
  tokenList: {
    paddingHorizontal: Spacing.m
  },
  input: {
    marginHorizontal: Spacing.xs
  },
  suggestedList: {
    marginTop: Spacing.xs
  },
  suggestedListContent: {
    paddingHorizontal: Spacing.s
  },
  suggestedToken: {
    marginRight: Spacing.s
  },
  suggestedSeparator: {
    marginTop: Spacing.s
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  }
});
