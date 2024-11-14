export const ErrorUtil = {
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
      longMessage: `Bundle ID not found on Allowlist - Please verify that your bundle ID is allowed at cloud.reown.com`
    },
    SOCIALS_TIMEOUT: {
      shortMessage: 'Invalid App Configuration',
      longMessage:
        'There was an issue loading the embedded wallet. Please verify that your bundle ID is allowed at cloud.reown.com'
    },
    JWT_TOKEN_NOT_VALID: {
      shortMessage: 'Session Expired',
      longMessage: 'Invalid session found - please check your time settings and connect again'
    },
    PROJECT_ID_NOT_CONFIGURED: {
      shortMessage: 'Project ID Not Configured',
      longMessage: 'Project ID Not Configured - update configuration'
    }
  }
};
