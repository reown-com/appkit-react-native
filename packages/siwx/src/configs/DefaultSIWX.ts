import type { SIWXMessenger } from '../core';
import { SIWXConfig } from '../core/SIWXConfig';
// import type { SIWXStorage } from '../core/SIWXStorage';
import { InformalMessenger } from '../messengers';
// import { LocalStorage } from '../storages';
// import { BIP122Verifier } from '../verifiers/BIP122Verifier';
import { EIP155Verifier } from '../verifiers';

const DEFAULTS = {
  getDefaultMessenger: (domain?: string, uri?: string) =>
    new InformalMessenger({
      domain: domain ?? 'Unknown Domain',
      uri: uri ?? 'Unknown URI',
      getNonce: async () =>
        Promise.resolve(
          Math.round(Math.random() * 100000000)
            .toString()
            .padStart(8, '0')
        )
    }),
  getDefaultVerifiers: () => [new EIP155Verifier()]
};

/**
 * This is the default configuration for SIWX.
 *
 * This configuration is split in three pieces `messenger`, `verifiers` and `storage`.
 * By default it uses InformalMessenger, EIP155Verifier.
 * You may override any of these defaults by passing your own configuration for the constructor.
 */
export class DefaultSIWX extends SIWXConfig {
  constructor(params: SIWXConfig.ConstructorParams & { messenger?: SIWXMessenger }) {
    super({
      messenger: params.messenger || DEFAULTS.getDefaultMessenger(params.domain, params.uri),
      verifiers: params.verifiers || DEFAULTS.getDefaultVerifiers(),
      storage: params.storage,
      required: params.required
    });
  }
}
