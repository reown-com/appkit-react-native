import { AppKit } from './client';
import type { AppKitOptions } from './utils/TypesUtil';
import { getAppKit } from './library/react/index';
import { CoreHelperUtil, type UseAppKitNetworkReturn } from '@reown/appkit-core';
import { PACKAGE_VERSION } from './constants';
import { useAppKitNetworkCore } from '@reown/appkit-core/react';
import type { AppKitNetwork } from '@reown/appkit/networks';

// -- Views ------------------------------------------------------------
// export * from '@reown/appkit-scaffold-ui';

// -- Hooks ------------------------------------------------------------
export * from './library/react/index';

// -- Utils & Other -----------------------------------------------------
export * from './utils/index';
export type * from '@reown/appkit-core';
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common';
export { CoreHelperUtil, AccountController } from '@reown/appkit-core';

export let modal: AppKit | undefined;

type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>;

export function createAppKit(options: CreateAppKit) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      sdkVersion: CoreHelperUtil.generateSdkVersion(
        options.adapters ?? [],
        'react',
        PACKAGE_VERSION
      )
    });
    getAppKit(modal);
  }

  return modal;
}

export { AppKit };
export type { AppKitOptions };

// -- Hooks ------------------------------------------------------------
export * from './library/react/index';

export function useAppKitNetwork(): UseAppKitNetworkReturn {
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore();

  function switchNetwork(network: AppKitNetwork) {
    modal?.switchNetwork(network);
  }

  return {
    caipNetwork,
    caipNetworkId,
    chainId,
    switchNetwork
  };
}

export { useAppKitAccount } from '@reown/appkit-core/react';
