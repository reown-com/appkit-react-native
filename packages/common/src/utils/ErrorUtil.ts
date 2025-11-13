export const ErrorUtil = {
  RPC_ERROR_CODE: {
    USER_REJECTED_REQUEST: 4001,
    USER_REJECTED_METHODS: 5002
  } as const,
  UniversalProviderErrors: {
    UNAUTHORIZED_DOMAIN_NOT_ALLOWED: {
      message: 'Unauthorized: origin not allowed',
      alertErrorKey: 'INVALID_APP_CONFIGURATION'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      message: 'Project ID is missing',
      alertErrorKey: 'PROJECT_ID_NOT_CONFIGURED'
    },
    JWT_VALIDATION_ERROR: {
      message: 'JWT validation error: JWT Token is not yet valid',
      alertErrorKey: 'JWT_TOKEN_NOT_VALID'
    }
  },
  ALERT_ERRORS: {
    INVALID_APP_CONFIGURATION: {
      shortMessage: 'Invalid App Configuration',
      longMessage: `Bundle ID not found on Allowlist - Please verify that your bundle ID is allowed at https://dashboard.reown.com`
    },
    SOCIALS_TIMEOUT: {
      shortMessage: 'Invalid App Configuration',
      longMessage:
        'There was an issue loading the embedded wallet. Please verify that your bundle ID is allowed at https://dashboard.reown.com'
    },
    JWT_TOKEN_NOT_VALID: {
      shortMessage: 'Session Expired',
      longMessage: 'Invalid session found - please check your time settings and connect again'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      shortMessage: 'Project ID Not Configured',
      longMessage: 'Project ID Not Configured - update configuration'
    }
  },
  isRpcProviderError(error: any): error is { message: string; code: number } {
    try {
      if (typeof error === 'object' && error !== null) {
        const objErr = error as Record<string, unknown>;

        const hasMessage = typeof objErr['message'] === 'string';
        const hasCode = typeof objErr['code'] === 'number';

        return hasMessage && hasCode;
      }

      return false;
    } catch {
      return false;
    }
  },
  isUserRejectedMessage(message: string) {
    return (
      message.toLowerCase().includes('rejected') ||
      message.toLowerCase().includes('user cancelled') ||
      message.toLowerCase().includes('user canceled')
    );
  },
  isUserRejectedRequestError(error: any) {
    if (ErrorUtil.isRpcProviderError(error)) {
      const isUserRejectedCode = error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_REQUEST;
      const isUserRejectedMethodsCode =
        error.code === ErrorUtil.RPC_ERROR_CODE.USER_REJECTED_METHODS;

      return (
        isUserRejectedCode ||
        isUserRejectedMethodsCode ||
        ErrorUtil.isUserRejectedMessage(error.message)
      );
    }

    if (error instanceof Error) {
      return ErrorUtil.isUserRejectedMessage(error.message);
    }

    return false;
  },
  isProposalExpiredError(error: any) {
    if (ErrorUtil.isRpcProviderError(error)) {
      return error.message?.toLowerCase().includes('proposal expired');
    }

    if (error) {
      return (
        typeof error?.message === 'string' &&
        error.message?.toLowerCase().includes('proposal expired')
      );
    }

    return false;
  },
  isWalletNotFoundError(error: any) {
    if (error && typeof error?.message === 'string') {
      return /wallet not found/i.test(error.message);
    }

    return false;
  },
  categorizeConnectionError(error: any): 'not_installed' | 'declined' | 'default' {
    if (ErrorUtil.isWalletNotFoundError(error)) {
      return 'not_installed';
    }

    if (ErrorUtil.isUserRejectedRequestError(error)) {
      return 'declined';
    }

    return 'default';
  }
};
