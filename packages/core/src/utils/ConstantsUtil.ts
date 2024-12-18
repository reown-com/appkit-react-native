import type { Features } from './TypeUtil';

const defaultFeatures: Features = {
  email: true,
  emailShowWallets: true,
  socials: ['x', 'discord', 'apple']
};

export const ConstantsUtil = {
  FOUR_MINUTES_MS: 240000,

  TEN_SEC_MS: 10000,

  ONE_SEC_MS: 1000,

  EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,

  LINKING_ERROR: 'LINKING_ERROR',

  NATIVE_TOKEN_ADDRESS: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',

  DEFAULT_FEATURES: defaultFeatures
};
