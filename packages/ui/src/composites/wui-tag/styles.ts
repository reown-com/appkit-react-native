import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';
import type { TagType } from '../../utils/TypesUtil';

export const getThemedColors = (variant?: TagType) =>
  ({
    main: {
      background: 'accent-glass-015',
      text: 'accent-100'
    },
    shade: {
      background: 'gray-glass-010',
      text: 'fg-200'
    },
    success: {
      background: 'icon-box-bg-success-100',
      text: 'success-100'
    },
    error: {
      background: 'icon-box-bg-error-100',
      text: 'error-100'
    },
    disabled: {
      background: 'gray-glass-010',
      text: 'fg-200'
    }
  })[variant || 'disabled'];

export default StyleSheet.create({
  container: {
    borderRadius: BorderRadius['5xs'],
    padding: Spacing['2xs']
  },
  text: {
    textTransform: 'uppercase'
  }
});
