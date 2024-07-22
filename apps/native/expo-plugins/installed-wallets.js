// based on https://github.com/expo/config-plugins/issues/123#issuecomment-1746757954

const { withAndroidManifest, createRunOncePlugin } = require('expo/config-plugins');

const queries = {
  package: [
    { $: { 'android:name': 'com.wallet.crypto.trustapp' } },
    { $: { 'android:name': 'io.metamask' } },
    { $: { 'android:name': 'me.rainbow' } },
    { $: { 'android:name': 'io.zerion.android' } },
    { $: { 'android:name': 'io.gnosis.safe' } },
    { $: { 'android:name': 'com.uniswap.mobile' } },
    { $: { 'android:name': 'im.token.app' } },
    { $: { 'android:name': 'com.spot.spot' } },
    { $: { 'android:name': 'fi.steakwallet.app' } },
    { $: { 'android:name': 'com.defi.wallet' } },
    { $: { 'android:name': 'vip.mytokenpocket' } },
    { $: { 'android:name': 'com.frontierwallet' } },
    { $: { 'android:name': 'piuk.blockchain.android' } },
    { $: { 'android:name': 'io.safepal.wallet' } },
    { $: { 'android:name': 'com.zengo.wallet' } },
    { $: { 'android:name': 'io.oneinch.android' } },
    { $: { 'android:name': 'exodusmovement.exodus' } },
    { $: { 'android:name': 'com.myetherwallet.mewwallet' } },
    { $: { 'android:name': 'io.stormbird.wallet' } },
    { $: { 'android:name': 'co.bacoor.keyring' } },
    { $: { 'android:name': 'com.lobstr.client' } },
    { $: { 'android:name': 'com.mathwallet.android' } },
    { $: { 'android:name': 'com.unstoppabledomains.manager' } },
    { $: { 'android:name': 'com.hashhalli.obvious' } },
    { $: { 'android:name': 'com.fireblocks.client' } },
    { $: { 'android:name': 'com.ambire.wallet' } },
    { $: { 'android:name': 'com.mtpelerin.bridge' } },
    { $: { 'android:name': 'com.internetmoneywallet.app' } },
    { $: { 'android:name': 'com.bitcoin.mwallet' } },
    { $: { 'android:name': 'coin98.crypto.finance.media' } },
    { $: { 'android:name': 'io.myabcwallet.mpc' } },
    { $: { 'android:name': 'finance.ottr.android' } },
    { $: { 'android:name': 'co.arculus.wallet.android' } },
    { $: { 'android:name': 'com.huddln' } },
    { $: { 'android:name': 'org.toshi' } }
    // Add other wallet package names here
  ]
};

/**
 * @param {import('@expo/config-plugins').ExportedConfig} config
 */
const withAndroidManifestService = config => {
  // eslint-disable-next-line no-shadow
  return withAndroidManifest(config, config => {
    config.modResults.manifest = {
      ...config.modResults.manifest,
      queries
    };

    return config;
  });
};

module.exports = createRunOncePlugin(
  withAndroidManifestService,
  'withAndroidManifestService',
  '1.0.0'
);
