import type { SIWXMessage, CaipNetworkId } from '@reown/appkit-common-react-native';
import { ConnectionsController } from '../../controllers/ConnectionsController';
import { OptionsController } from '../../controllers/OptionsController';
import { CoreHelperUtil } from '../../utils/CoreHelperUtil';

export class ReownAuthenticationMessenger {
  public resources?: SIWXMessage['resources'];

  protected getNonce: (params: SIWXMessage.Input) => Promise<SIWXMessage['nonce']>;

  constructor(params: ReownAuthenticationMessenger.ConstructorParams) {
    this.getNonce = params.getNonce;
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    const metadata = OptionsController.state.metadata;
    const domain = CoreHelperUtil.getBundleId();
    const params = {
      accountAddress: input.accountAddress,
      chainId: input.chainId,
      version: '1',
      domain: domain ?? 'Unknown Domain',
      uri: metadata?.redirect?.universal ?? metadata?.redirect?.native ?? 'Unknown URI',
      resources: this.resources,
      nonce: await this.getNonce(input),
      issuedAt: this.stringifyDate(new Date()),
      statement: undefined,
      expirationTime: undefined,
      notBefore: undefined
    };

    const methods = {
      toString: () => this.stringify(params)
    } satisfies SIWXMessage.Methods;

    return Object.assign(params, methods);
  }

  private stringify(params: SIWXMessage.Data): string {
    const networkName = this.getNetworkName(params.chainId);

    return [
      `${params.domain} wants you to sign in with your ${networkName} account:`,
      params.accountAddress,
      params.statement ? `\n${params.statement}\n` : '',
      `URI: ${params.uri}`,
      `Version: ${params.version}`,
      `Chain ID: ${params.chainId}`,
      `Nonce: ${params.nonce}`,
      params.issuedAt && `Issued At: ${params.issuedAt}`,
      params.expirationTime && `Expiration Time: ${params.expirationTime}`,
      params.notBefore && `Not Before: ${params.notBefore}`,
      params.requestId && `Request ID: ${params.requestId}`,
      params.resources?.length &&
        params.resources.reduce((acc, resource) => `${acc}\n- ${resource}`, 'Resources:')
    ]
      .filter(line => typeof line === 'string')
      .join('\n')
      .trim();
  }

  private getNetworkName(chainId: CaipNetworkId): string | undefined {
    const requestedNetworks = ConnectionsController.state.networks;

    return (
      requestedNetworks.find(network => network.caipNetworkId === chainId)?.name ||
      'Unknown Network'
    );
  }

  private stringifyDate(date: Date): string {
    return date.toISOString();
  }
}

export namespace ReownAuthenticationMessenger {
  export interface ConstructorParams {
    getNonce: (params: SIWXMessage.Input) => Promise<SIWXMessage['nonce']>;
  }
}
