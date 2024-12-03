import { Spacing } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'flex-end'
  },
  backdrop: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0
  },
  hidden: {
    display: 'none'
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center'
  },
  title: {
    marginTop: Spacing.s,
    marginBottom: Spacing.xs
  },
  button: {
    marginTop: Spacing.xl,
    width: '100%'
  }
});
