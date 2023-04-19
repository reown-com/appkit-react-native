export default () => ({
  expo: {
    name: 'web3modal-rn-example',
    slug: 'web3modal-rn-example',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'c731a682-cac7-4f3b-838d-bd79ae66b994',
      },
      PROJECT_ID: process.env.PROJECT_ID || null,
    },
    owner: 'nachinn.s',
  },
});
