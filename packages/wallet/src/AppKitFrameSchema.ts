import { z } from 'zod';
import { AppKitFrameConstants, AppKitFrameRpcConstants } from './AppKitFrameConstants';

// -- Helpers ----------------------------------------------------------------
const zError = z.object({ message: z.string() });

function zType<K extends keyof typeof AppKitFrameConstants>(key: K) {
  return z.literal(AppKitFrameConstants[key]);
}

// -- Responses --------------------------------------------------------------
export const GetTransactionByHashResponse = z.object({
  accessList: z.array(z.string()),
  blockHash: z.string().nullable(),
  blockNumber: z.string().nullable(),
  chainId: z.string(),
  from: z.string(),
  gas: z.string(),
  hash: z.string(),
  input: z.string().nullable(),
  maxFeePerGas: z.string(),
  maxPriorityFeePerGas: z.string(),
  nonce: z.string(),
  r: z.string(),
  s: z.string(),
  to: z.string(),
  transactionIndex: z.string().nullable(),
  type: z.string(),
  v: z.string(),
  value: z.string()
});
export const AppSwitchNetworkRequest = z.object({ chainId: z.string().or(z.number()) });
export const AppConnectEmailRequest = z.object({ email: z.string().email() });
export const AppConnectOtpRequest = z.object({ otp: z.string() });
export const AppConnectSocialRequest = z.object({ uri: z.string() });
export const AppGetSocialRedirectUriRequest = z.object({
  provider: z.enum(['google', 'github', 'apple', 'facebook', 'x', 'discord', 'farcaster'])
});
export const AppGetUserRequest = z.object({ chainId: z.optional(z.string().or(z.number())) });
export const AppUpdateEmailRequest = z.object({ email: z.string().email() });
export const AppUpdateEmailPrimaryOtpRequest = z.object({ otp: z.string() });
export const AppUpdateEmailSecondaryOtpRequest = z.object({ otp: z.string() });
export const AppSyncThemeRequest = z.object({
  themeMode: z.optional(z.enum(['light', 'dark'])),
  themeVariables: z.optional(z.record(z.string(), z.string().or(z.number()))),
  w3mThemeVariables: z.optional(z.record(z.string(), z.string().or(z.number())))
});
export const AppSyncDappDataRequest = z.object({
  metadata: z
    .object({
      name: z.string(),
      description: z.string(),
      url: z.string(),
      icons: z.array(z.string())
    })
    .optional(),
  sdkVersion: z.string() as z.ZodType<
    | `react-native-wagmi-${string}`
    | `react-native-ethers5-${string}`
    | `react-native-ethers-${string}`
  >,
  projectId: z.string()
});
export const AppSetPreferredAccountRequest = z.object({ type: z.string() });

const AccountTypeEnum = z.enum([
  AppKitFrameRpcConstants.ACCOUNT_TYPES.EOA,
  AppKitFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
]);

export const FrameConnectEmailResponse = z.object({
  action: z.enum(['VERIFY_DEVICE', 'VERIFY_OTP'])
});
export const FrameUpdateEmailResponse = z.object({
  action: z.enum(['VERIFY_PRIMARY_OTP', 'VERIFY_SECONDARY_OTP'])
});
export const FrameGetUserResponse = z.object({
  email: z.string().email().optional().nullable(),
  address: z.string(),
  chainId: z.string().or(z.number()),
  smartAccountDeployed: z.boolean(),
  preferredAccountType: AccountTypeEnum
});
export const FrameIsConnectedResponse = z.object({ isConnected: z.boolean() });
export const FrameGetChainIdResponse = z.object({ chainId: z.number() });
export const FrameSwitchNetworkResponse = z.object({ chainId: z.number() });
export const FrameUpdateEmailSecondaryOtpResponse = z.object({ newEmail: z.string().email() });
export const FrameGetSocialRedirectUriResponse = z.object({ uri: z.string() });

export const FrameConnectSocialResponse = z.object({
  email: z.string(),
  address: z.string(),
  chainId: z.string().or(z.number()),
  accounts: z
    .array(
      z.object({
        address: z.string(),
        type: AccountTypeEnum
      })
    )
    .optional(),
  userName: z.string().optional()
});

export const FrameGetFarcasterUriResponse = z.object({
  url: z.string()
});

export const FrameConnectFarcasterResponse = z.object({
  userName: z.string()
});

export const FrameSetPreferredAccountResponse = z.object({
  type: AccountTypeEnum,
  address: z.string()
});

export const FrameGetSmartAccountEnabledNetworksResponse = z.object({
  smartAccountEnabledNetworks: z.array(z.number())
});

export const RpcResponse = z.any();

export const RpcEthAccountsRequest = z.object({
  method: z.literal('eth_accounts')
});
export const RpcEthBlockNumber = z.object({
  method: z.literal('eth_blockNumber')
});

export const RpcEthCall = z.object({
  method: z.literal('eth_call'),
  params: z.array(z.any())
});

export const RpcEthChainId = z.object({
  method: z.literal('eth_chainId')
});

export const RpcEthEstimateGas = z.object({
  method: z.literal('eth_estimateGas'),
  params: z.array(z.any())
});

export const RpcEthFeeHistory = z.object({
  method: z.literal('eth_feeHistory'),
  params: z.array(z.any())
});

export const RpcEthGasPrice = z.object({
  method: z.literal('eth_gasPrice')
});

export const RpcEthGetAccount = z.object({
  method: z.literal('eth_getAccount'),
  params: z.array(z.any())
});

export const RpcEthGetBalance = z.object({
  method: z.literal('eth_getBalance'),
  params: z.array(z.any())
});

export const RpcEthGetBlockyByHash = z.object({
  method: z.literal('eth_getBlockByHash'),
  params: z.array(z.any())
});

export const RpcEthGetBlockByNumber = z.object({
  method: z.literal('eth_getBlockByNumber'),
  params: z.array(z.any())
});

export const RpcEthGetBlockReceipts = z.object({
  method: z.literal('eth_getBlockReceipts'),
  params: z.array(z.any())
});

export const RcpEthGetBlockTransactionCountByHash = z.object({
  method: z.literal('eth_getBlockTransactionCountByHash'),
  params: z.array(z.any())
});

export const RcpEthGetBlockTransactionCountByNumber = z.object({
  method: z.literal('eth_getBlockTransactionCountByNumber'),
  params: z.array(z.any())
});

export const RpcEthGetCode = z.object({
  method: z.literal('eth_getCode'),
  params: z.array(z.any())
});

export const RpcEthGetFilter = z.object({
  method: z.literal('eth_getFilterChanges'),
  params: z.array(z.any())
});

export const RpcEthGetFilterLogs = z.object({
  method: z.literal('eth_getFilterLogs'),
  params: z.array(z.any())
});

export const RpcEthGetLogs = z.object({
  method: z.literal('eth_getLogs'),
  params: z.array(z.any())
});

export const RpcEthGetProof = z.object({
  method: z.literal('eth_getProof'),
  params: z.array(z.any())
});

export const RpcEthGetStorageAt = z.object({
  method: z.literal('eth_getStorageAt'),
  params: z.array(z.any())
});

export const RpcEthGetTransactionByBlockHashAndIndex = z.object({
  method: z.literal('eth_getTransactionByBlockHashAndIndex'),
  params: z.array(z.any())
});

export const RpcEthGetTransactionByBlockNumberAndIndex = z.object({
  method: z.literal('eth_getTransactionByBlockNumberAndIndex'),
  params: z.array(z.any())
});

export const RpcEthGetTransactionByHash = z.object({
  method: z.literal('eth_getTransactionByHash'),
  params: z.array(z.any())
});

export const RpcEthGetTransactionCount = z.object({
  method: z.literal('eth_getTransactionCount'),
  params: z.array(z.any())
});

export const RpcEthGetTransactionReceipt = z.object({
  method: z.literal('eth_getTransactionReceipt'),
  params: z.array(z.any())
});

export const RpcEthGetUncleCountByBlockHash = z.object({
  method: z.literal('eth_getUncleCountByBlockHash'),
  params: z.array(z.any())
});

export const RpcEthGetUncleCountByBlockNumber = z.object({
  method: z.literal('eth_getUncleCountByBlockNumber'),
  params: z.array(z.any())
});

export const RpcEthMaxPriorityFeePerGas = z.object({
  method: z.literal('eth_maxPriorityFeePerGas')
});

export const RpcEthNewBlockFilter = z.object({
  method: z.literal('eth_newBlockFilter')
});

export const RpcEthNewFilter = z.object({
  method: z.literal('eth_newFilter'),
  params: z.array(z.any())
});

export const RpcEthNewPendingTransactionFilter = z.object({
  method: z.literal('eth_newPendingTransactionFilter')
});

export const RpcEthSendRawTransaction = z.object({
  method: z.literal('eth_sendRawTransaction'),
  params: z.array(z.any())
});

export const RpcEthSyncing = z.object({
  method: z.literal('eth_syncing'),
  params: z.array(z.any())
});

export const RpcUnistallFilter = z.object({
  method: z.literal('eth_uninstallFilter'),
  params: z.array(z.any())
});

export const RpcPersonalSignRequest = z.object({
  method: z.literal('personal_sign'),
  params: z.array(z.any())
});

export const RpcEthSignTypedDataV4 = z.object({
  method: z.literal('eth_signTypedData_v4'),
  params: z.array(z.any())
});

export const RpcEthSendTransactionRequest = z.object({
  method: z.literal('eth_sendTransaction'),
  params: z.array(z.any())
});

export const FrameSession = z.object({
  token: z.string()
});

export const EventSchema = z.object({
  // Remove optional once all packages are updated
  id: z.string().optional()
});

export const AppKitFrameSchema = {
  // -- App Events -----------------------------------------------------------

  appEvent: EventSchema.extend({
    type: zType('APP_SWITCH_NETWORK'),
    payload: AppSwitchNetworkRequest
  })

    .or(EventSchema.extend({ type: zType('APP_CONNECT_EMAIL'), payload: AppConnectEmailRequest }))

    .or(EventSchema.extend({ type: zType('APP_CONNECT_DEVICE') }))

    .or(EventSchema.extend({ type: zType('APP_CONNECT_OTP'), payload: AppConnectOtpRequest }))

    .or(
      EventSchema.extend({
        type: zType('APP_CONNECT_SOCIAL'),
        payload: AppConnectSocialRequest
      })
    )

    .or(EventSchema.extend({ type: zType('APP_GET_USER'), payload: z.optional(AppGetUserRequest) }))

    .or(
      EventSchema.extend({
        type: zType('APP_GET_SOCIAL_REDIRECT_URI'),
        payload: AppGetSocialRedirectUriRequest
      })
    )

    .or(EventSchema.extend({ type: zType('APP_GET_FARCASTER_URI') }))

    .or(EventSchema.extend({ type: zType('APP_CONNECT_FARCASTER') }))

    .or(EventSchema.extend({ type: zType('APP_SIGN_OUT') }))

    .or(EventSchema.extend({ type: zType('APP_IS_CONNECTED'), payload: z.optional(FrameSession) }))

    .or(EventSchema.extend({ type: zType('APP_GET_CHAIN_ID') }))

    .or(EventSchema.extend({ type: zType('APP_GET_SMART_ACCOUNT_ENABLED_NETWORKS') }))

    .or(
      EventSchema.extend({
        type: zType('APP_SET_PREFERRED_ACCOUNT'),
        payload: AppSetPreferredAccountRequest
      })
    )

    .or(
      EventSchema.extend({
        type: zType('APP_RPC_REQUEST'),
        payload: RpcPersonalSignRequest.or(RpcEthSendTransactionRequest)
          .or(RpcEthAccountsRequest)
          .or(RpcEthBlockNumber)
          .or(RpcEthCall)
          .or(RpcEthChainId)
          .or(RpcEthEstimateGas)
          .or(RpcEthFeeHistory)
          .or(RpcEthGasPrice)
          .or(RpcEthGetAccount)
          .or(RpcEthGetBalance)
          .or(RpcEthGetBlockyByHash)
          .or(RpcEthGetBlockByNumber)
          .or(RpcEthGetBlockReceipts)
          .or(RcpEthGetBlockTransactionCountByHash)
          .or(RcpEthGetBlockTransactionCountByNumber)
          .or(RpcEthGetCode)
          .or(RpcEthGetFilter)
          .or(RpcEthGetFilterLogs)
          .or(RpcEthGetLogs)
          .or(RpcEthGetProof)
          .or(RpcEthGetStorageAt)
          .or(RpcEthGetTransactionByBlockHashAndIndex)
          .or(RpcEthGetTransactionByBlockNumberAndIndex)
          .or(RpcEthGetTransactionByHash)
          .or(RpcEthGetTransactionCount)
          .or(RpcEthGetTransactionReceipt)
          .or(RpcEthGetUncleCountByBlockHash)
          .or(RpcEthGetUncleCountByBlockNumber)
          .or(RpcEthMaxPriorityFeePerGas)
          .or(RpcEthNewBlockFilter)
          .or(RpcEthNewFilter)
          .or(RpcEthNewPendingTransactionFilter)
          .or(RpcEthSendRawTransaction)
          .or(RpcEthSyncing)
          .or(RpcUnistallFilter)
          .or(RpcPersonalSignRequest)
          .or(RpcEthSignTypedDataV4)
          .or(RpcEthSendTransactionRequest)
      })
    )

    .or(EventSchema.extend({ type: zType('APP_UPDATE_EMAIL'), payload: AppUpdateEmailRequest }))

    .or(
      EventSchema.extend({
        type: zType('APP_UPDATE_EMAIL_PRIMARY_OTP'),
        payload: AppUpdateEmailPrimaryOtpRequest
      })
    )

    .or(
      EventSchema.extend({
        type: zType('APP_UPDATE_EMAIL_SECONDARY_OTP'),
        payload: AppUpdateEmailSecondaryOtpRequest
      })
    )

    .or(EventSchema.extend({ type: zType('APP_SYNC_THEME'), payload: AppSyncThemeRequest }))

    .or(EventSchema.extend({ type: zType('APP_SYNC_DAPP_DATA'), payload: AppSyncDappDataRequest })),

  // -- Frame Events ---------------------------------------------------------
  frameEvent: EventSchema.extend({
    type: zType('FRAME_SWITCH_NETWORK_ERROR'),
    payload: zError,
    origin: z.string()
  })

    .or(
      EventSchema.extend({
        type: zType('FRAME_SWITCH_NETWORK_SUCCESS'),
        payload: FrameSwitchNetworkResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_EMAIL_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_EMAIL_SUCCESS'),
        payload: FrameConnectEmailResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_OTP_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(EventSchema.extend({ type: zType('FRAME_CONNECT_OTP_SUCCESS'), origin: z.string() }))

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_DEVICE_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_SOCIAL_SUCCESS'),
        payload: FrameConnectSocialResponse,
        origin: z.string()
      })
    )
    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_SOCIAL_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_FARCASTER_URI_SUCCESS'),
        payload: FrameGetFarcasterUriResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_FARCASTER_URI_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_FARCASTER_SUCCESS'),
        payload: FrameConnectFarcasterResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_CONNECT_FARCASTER_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(EventSchema.extend({ type: zType('FRAME_CONNECT_DEVICE_SUCCESS'), origin: z.string() }))

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_USER_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_USER_SUCCESS'),
        payload: FrameGetUserResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_SOCIAL_REDIRECT_URI_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_SOCIAL_REDIRECT_URI_SUCCESS'),
        payload: FrameGetSocialRedirectUriResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_SIGN_OUT_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(EventSchema.extend({ type: zType('FRAME_SIGN_OUT_SUCCESS'), origin: z.string() }))

    .or(
      EventSchema.extend({
        type: zType('FRAME_IS_CONNECTED_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_IS_CONNECTED_SUCCESS'),
        payload: FrameIsConnectedResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_CHAIN_ID_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_CHAIN_ID_SUCCESS'),
        payload: FrameGetChainIdResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_RPC_REQUEST_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_RPC_REQUEST_SUCCESS'),
        payload: RpcResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_SESSION_UPDATE'),
        payload: FrameSession,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_SUCCESS'),
        payload: FrameUpdateEmailResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_PRIMARY_OTP_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_PRIMARY_OTP_SUCCESS'),
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_SECONDARY_OTP_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_UPDATE_EMAIL_SECONDARY_OTP_SUCCESS'),
        payload: FrameUpdateEmailSecondaryOtpResponse,
        origin: z.string()
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_SYNC_THEME_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(EventSchema.extend({ type: zType('FRAME_SYNC_THEME_SUCCESS'), origin: z.string() }))

    .or(
      EventSchema.extend({
        type: zType('FRAME_SYNC_DAPP_DATA_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )

    .or(EventSchema.extend({ type: zType('FRAME_SYNC_DAPP_DATA_SUCCESS'), origin: z.string() }))

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS'),
        payload: FrameGetSmartAccountEnabledNetworksResponse
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR'),
        payload: zError
      })
    )

    .or(
      EventSchema.extend({
        type: zType('FRAME_SET_PREFERRED_ACCOUNT_SUCCESS'),
        payload: FrameSetPreferredAccountResponse,
        origin: z.string()
      })
    )
    .or(
      EventSchema.extend({
        type: zType('FRAME_SET_PREFERRED_ACCOUNT_ERROR'),
        payload: zError,
        origin: z.string()
      })
    )
};
