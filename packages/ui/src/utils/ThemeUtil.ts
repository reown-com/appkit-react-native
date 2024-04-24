import type { SpacingType, ThemeKeys } from './TypesUtil';

export const DarkTheme: { [key in ThemeKeys]: string } = {
  'accent-100': '#667DFF',
  'accent-090': '#7388FD',
  'accent-080': '#7F92FA',
  'accent-020': '#5869D1',
  'accent-glass-090': 'rgba(102, 125, 255, 0.90)',
  'accent-glass-080': 'rgba(102, 125, 255, 0.80)',
  'accent-glass-020': 'rgba(102, 125, 255, 0.2)',
  'accent-glass-015': 'rgba(102, 125, 255, 0.15)',
  'accent-glass-010': 'rgba(102, 125, 255, 0.1)',
  'accent-glass-005': 'rgba(102, 125, 255, 0.05)',
  'accent-glass-002': 'rgba(102, 125, 255, 0.02)',

  'fg-100': '#E4E7E7',
  'fg-125': '#D0D5D5',
  'fg-150': '#A8B1B1',
  'fg-175': '#A8B0B0',
  'fg-200': '#949E9E',
  'fg-225': '#868F8F',
  'fg-250': '#788080',
  'fg-275': '#788181',
  'fg-300': '#6E7777',

  'bg-100': '#121313',
  'bg-125': '#191A1A',
  'bg-150': '#1E1F1F',
  'bg-175': '#222525',
  'bg-200': '#272A2A',
  'bg-225': '#2C3030',
  'bg-250': '#313535',
  'bg-275': '#363B3B',
  'bg-300': '#3B4040',

  'inverse-100': '#FFFFFF',
  'inverse-000': '#000000',

  'success-100': '#26D962',
  'success-glass-020': 'rgba(38, 217, 98, 0.20)',
  'success-glass-015': 'rgba(38, 217, 98, 0.15)',
  'success-glass-010': 'rgba(38, 217, 98, 0.10)',
  'success-glass-005': 'rgba(38, 217, 98, 0.05)',

  'error-100': '#F25A67',
  'error-glass-020': 'rgba(242, 90, 103, 0.20)',
  'error-glass-015': 'rgba(242, 90, 103, 0.15)',
  'error-glass-010': 'rgba(242, 90, 103, 0.10)',
  'error-glass-005': 'rgba(242, 90, 103, 0.05)',

  'teal-100': '#36e2e2',
  'magenta-100': '#cb4d8c',
  'indigo-100': '#516dfb',
  'orange-100': '#ffa64c',
  'purple-100': '#906ef7',
  'yellow-100': '#faff00',

  'gray-glass-001': 'rgba(255, 255, 255, 0.01)',
  'gray-glass-002': 'rgba(255, 255, 255, 0.02)',
  'gray-glass-005': 'rgba(255, 255, 255, 0.05)',
  'gray-glass-010': 'rgba(255, 255, 255, 0.1)',
  'gray-glass-015': 'rgba(255, 255, 255, 0.15)',
  'gray-glass-020': 'rgba(255, 255, 255, 0.2)',
  'gray-glass-025': 'rgba(255, 255, 255, 0.25)',
  'gray-glass-030': 'rgba(255, 255, 255, 0.3)',
  'gray-glass-060': 'rgba(255, 255, 255, 0.6)',
  'gray-glass-070': 'rgba(255, 255, 255, 0.7)',
  'gray-glass-080': 'rgba(255, 255, 255, 0.8)',
  'gray-glass-090': 'rgba(255, 255, 255, 0.9)',

  //IconBox
  'icon-box-bg-error-100': '#3c2426',
  'icon-box-bg-success-100': '#1f3a28'
};

export const LightTheme: { [key in ThemeKeys]: string } = {
  'accent-100': '#5570FF',
  'accent-090': '#4F67E7',
  'accent-080': '#485ED0',
  'accent-020': '#788DFF',
  'accent-glass-090': 'rgba(85, 112, 255, 0.90)',
  'accent-glass-080': 'rgba(85, 112, 255, 0.8)',
  'accent-glass-020': 'rgba(85, 112, 255, 0.2)',
  'accent-glass-015': 'rgba(85, 112, 255, 0.15)',
  'accent-glass-010': 'rgba(85, 112, 255, 0.1)',
  'accent-glass-005': 'rgba(85, 112, 255, 0.05)',
  'accent-glass-002': 'rgba(85, 112, 255, 0.02)',

  'fg-100': '#141414',
  'fg-125': '#2d3131',
  'fg-150': '#474d4d',
  'fg-175': '#636d6d',
  'fg-200': '#798686',
  'fg-225': '#828f8f',
  'fg-250': '#8b9797',
  'fg-275': '#95a0a0',
  'fg-300': '#9ea9a9',

  'bg-100': '#ffffff',
  'bg-125': '#ffffff',
  'bg-150': '#f3f8f8',
  'bg-175': '#eef4f4',
  'bg-200': '#eaf1f1',
  'bg-225': '#e5eded',
  'bg-250': '#e1e9e9',
  'bg-275': '#dce7e7',
  'bg-300': '#d8e3e3',

  'inverse-100': '#FFFFFF',
  'inverse-000': '#000000',

  'success-100': '#26B562',
  'success-glass-020': 'rgba(38, 181, 98, 0.20)',
  'success-glass-015': 'rgba(38, 181, 98, 0.15)',
  'success-glass-010': 'rgba(38, 181, 98, 0.10)',
  'success-glass-005': 'rgba(38, 181, 98, 0.05)',

  'error-100': '#F05142',
  'error-glass-020': 'rgba(240, 81, 66, 0.20)',
  'error-glass-015': 'rgba(240, 81, 66, 0.15)',
  'error-glass-010': 'rgba(240, 81, 66, 0.10)',
  'error-glass-005': 'rgba(240, 81, 66, 0.05)',

  'teal-100': '#2bb6b6',
  'magenta-100': '#c65380',
  'indigo-100': '#3d5cf5',
  'orange-100': '#ea8c2e',
  'purple-100': '#794cff',
  'yellow-100': '#eccc1c',

  'gray-glass-001': 'rgba(0, 0, 0, 0.01)',
  'gray-glass-002': 'rgba(0, 0, 0, 0.02)',
  'gray-glass-005': 'rgba(0, 0, 0, 0.05)',
  'gray-glass-010': 'rgba(0, 0, 0, 0.1)',
  'gray-glass-015': 'rgba(0, 0, 0, 0.15)',
  'gray-glass-020': 'rgba(0, 0, 0, 0.2)',
  'gray-glass-025': 'rgba(0, 0, 0, 0.25)',
  'gray-glass-030': 'rgba(0, 0, 0, 0.3)',
  'gray-glass-060': 'rgba(0, 0, 0, 0.6)',
  'gray-glass-070': 'rgba(0, 0, 0, 0.7)',
  'gray-glass-080': 'rgba(0, 0, 0, 0.8)',
  'gray-glass-090': 'rgba(0, 0, 0, 0.9)',

  //IconBox
  'icon-box-bg-error-100': '#f4dfdd',
  'icon-box-bg-success-100': '#daf0e4'
};

export const BorderRadius = {
  '5xs': 4,
  '4xs': 6,
  '3xs': 8,
  'xxs': 12,
  'xs': 16,
  's': 20,
  'm': 28,
  'l': 36,
  '3xl': 80
};

export const IconSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20
};

export const SpinnerSize = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32
};

export const Spacing: { [K in SpacingType]: number } = {
  '0': 0,
  '4xs': 2,
  '3xs': 4,
  '2xs': 6,
  'xs': 8,
  's': 12,
  'm': 14,
  'l': 16,
  'xl': 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40
};

export const WalletImageSize = {
  xs: 15,
  sm: 40,
  md: 56,
  lg: 80
};
