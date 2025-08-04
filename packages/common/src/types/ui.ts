import type { SocialProvider } from './common';

type EnabledSocials = SocialProvider;

export type Features = {
  /**
   * @description Enable or disable the swaps feature. Enabled by default.
   * @type {boolean}
   */
  swaps?: boolean;
  /**
   * @description Enable or disable the onramp feature. Enabled by default.
   * @type {boolean}
   */
  onramp?: boolean;
  /**
   * @description Show or hide the regular wallet options when socials are enabled. Enabled by default.
   * @type {boolean}
   */
  showWallets?: boolean;
  /**
   * @description Enable or disable the socials feature. Enabled by default.
   * @type {EnabledSocials[]}
   */
  socials?: EnabledSocials[] | false;
};
