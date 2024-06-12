import { AssetController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('AssetController', () => {
  it('should have valid default state', () => {
    expect(AssetController.state).toEqual({
      connectorImages: {},
      walletImages: {},
      networkImages: {},
      tokenImages: {}
    });
  });

  it('should save token images correctly', () => {
    const MOCK_TOKEN_ID = '1';
    const MOCK_TOKEN_IMAGE = 'https://example.com';

    AssetController.setTokenImage(MOCK_TOKEN_ID, MOCK_TOKEN_IMAGE);
    expect(AssetController.state.tokenImages[MOCK_TOKEN_ID]).toEqual(MOCK_TOKEN_IMAGE);
  });

  it('should save network images correctly', () => {
    const MOCK_NETWORK_ID = 'ba0ba0cd-17c6-4806-ad93-f9d174f17900';
    const MOCK_NETWORK_IMAGE =
      'https://api.web3modal.com/public/getAssetImage/ba0ba0cd-17c6-4806-ad93-f9d174f17900';

    AssetController.setNetworkImage(MOCK_NETWORK_ID, MOCK_NETWORK_IMAGE);
    expect(AssetController.state.networkImages[MOCK_NETWORK_ID]).toEqual(MOCK_NETWORK_IMAGE);
  });

  it('should save wallet images correctly', () => {
    const MOCK_WALLET_ID = '7c5ff577-a68d-49c5-02cd-3d83637b0b00';
    const MOCK_WALLET_IMAGE =
      'https://api.web3modal.com/getWalletImage/7c5ff577-a68d-49c5-02cd-3d83637b0b00';

    AssetController.setWalletImage(MOCK_WALLET_ID, MOCK_WALLET_IMAGE);
    expect(AssetController.state.walletImages[MOCK_WALLET_ID]).toEqual(MOCK_WALLET_IMAGE);
  });

  it('should save connector images correctly', () => {
    const MOCK_CONNECTOR_ID = '7c5ff577-a68d-49c5-02cd-3d83637b0b00';
    const MOCK_CONNECTOR_IMAGE =
      'https://api.web3modal.com/getWalletImage/7c5ff577-a68d-49c5-02cd-3d83637b0b00';

    AssetController.setConnectorImage(MOCK_CONNECTOR_ID, MOCK_CONNECTOR_IMAGE);
    expect(AssetController.state.connectorImages[MOCK_CONNECTOR_ID]).toEqual(MOCK_CONNECTOR_IMAGE);
  });
});
