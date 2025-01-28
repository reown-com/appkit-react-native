import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end'
  },
  header: {
    marginBottom: Spacing.l
  },
  container: {
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  content: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m
  },
  separator: {
    height: Spacing.s
  },
  iconPlaceholder: {
    height: 32,
    width: 32
  }
});
