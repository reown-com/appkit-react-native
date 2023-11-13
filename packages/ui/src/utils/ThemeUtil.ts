import type { SpacingType, ThemeKeys } from './TypesUtil';

export const DarkTheme: { [key in ThemeKeys]: string } = {
  'accent-100': '#47a1ff',
  'accent-090': '#59aaff',
  'accent-020': '#6cb4ff',
  'accent-glass-090': 'rgba(51, 150, 255, 0.90)',
  'accent-glass-080': 'rgba(51, 150, 255, 0.80)',
  'accent-glass-020': 'rgba(71, 161, 255, 0.2)',
  'accent-glass-015': 'rgba(71, 161, 255, 0.15)',
  'accent-glass-010': 'rgba(71, 161, 255, 0.1)',
  'accent-glass-005': 'rgba(71, 161, 255, 0.05)',
  'accent-glass-002': 'rgba(51, 150, 255, 0.02)',

  'fg-100': '#e4e7e7',
  'fg-125': '#d0d5d5',
  'fg-150': '#a8b1b1',
  'fg-175': '#a8b0b0',
  'fg-200': '#949e9e',
  'fg-225': '#868f8f',
  'fg-250': '#788080',
  'fg-275': '#788181',
  'fg-300': '#6e7777',

  'bg-100': '#141414',
  'bg-125': '#191a1a',
  'bg-150': '#1e1f1f',
  'bg-175': '#222525',
  'bg-200': '#272a2a',
  'bg-225': '#2c3030',
  'bg-250': '#313535',
  'bg-275': '#363b3b',
  'bg-300': '#3b4040',

  'inverse-100': '#ffffff',
  'inverse-000': '#000000',

  'success-100': '#26d962',
  'error-100': '#f25a67',

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
  'gray-glass-080': 'rgba(255, 255, 255, 0.8)',
  'gray-glass-090': 'rgba(255, 255, 255, 0.9)',

  //IconBox
  'icon-box-bg-error-100': '#3c2426',
  'icon-box-bg-success-100': '#1f3a28'
};

export const LightTheme: { [key in ThemeKeys]: string } = {
  'accent-100': '#3396ff',
  'accent-090': '#2d7dd2',
  'accent-020': '#2978cc',
  'accent-glass-090': 'rgba(51, 150, 255, 0.9)',
  'accent-glass-080': 'rgba(51, 150, 255, 0.8)',
  'accent-glass-020': 'rgba(51, 150, 255, 0.2)',
  'accent-glass-015': 'rgba(51, 150, 255, 0.15)',
  'accent-glass-010': 'rgba(51, 150, 255, 0.1)',
  'accent-glass-005': 'rgba(51, 150, 255, 0.05)',
  'accent-glass-002': 'rgba(51, 150, 255, 0.02)',

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

  'inverse-100': '#ffffff',
  'inverse-000': '#000000',

  'success-100': '#26b562',
  'error-100': '#f05142',

  'teal-100': '#2bb6b6',
  'magenta-100': '#c65380',
  'indigo-100': '#3d5cf5',
  'orange-100': '#ea8c2e',
  'purple-100': '#794cff',
  'yellow-100': '#eccc1c',

  'gray-glass-001': 'rgba(255, 255, 255, 0.01)',
  'gray-glass-002': 'rgba(0, 0, 0, 0.02)',
  'gray-glass-005': 'rgba(0, 0, 0, 0.05)',
  'gray-glass-010': 'rgba(0, 0, 0, 0.1)',
  'gray-glass-015': 'rgba(0, 0, 0, 0.15)',
  'gray-glass-020': 'rgba(0, 0, 0, 0.2)',
  'gray-glass-025': 'rgba(0, 0, 0, 0.25)',
  'gray-glass-030': 'rgba(0, 0, 0, 0.3)',
  'gray-glass-060': 'rgba(0, 0, 0, 0.6)',
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
  md: 14,
  lg: 24
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
