import type {
  CaipNetworkId,
  SIWXSession,
  SIWXStorage,
  Storage
} from '@reown/appkit-common-react-native';

export class DefaultStorage implements SIWXStorage {
  private key: string;
  private storage: Storage;

  constructor(params: CustomStorage.ConstructorParams) {
    this.key = params.key ?? '@appkit/siwx';
    this.storage = params.storage;
  }

  async add(session: SIWXSession): Promise<void> {
    const sessions = await this.getSessions();
    sessions.push(session);
    this.setSessions(sessions);

    return Promise.resolve();
  }

  set(sessions: SIWXSession[]): Promise<void> {
    this.setSessions(sessions);

    return Promise.resolve();
  }

  async get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    const allSessions = await this.getSessions();

    const validSessions = allSessions.filter(session => {
      const isSameChain = session.data.chainId === chainId;
      const isSameAddress = session.data.accountAddress === address;

      const startsAt = session.data.notBefore || session.data.issuedAt;
      if (startsAt && Date.parse(startsAt) > Date.now()) {
        return false;
      }

      const endsAt = session.data.expirationTime;
      if (endsAt && Date.now() > Date.parse(endsAt)) {
        return false;
      }

      return isSameChain && isSameAddress;
    });

    return Promise.resolve(validSessions);
  }

  async delete(chainId: string, address: string): Promise<void> {
    const sessions = (await this.getSessions()).filter(
      session => session.data.chainId !== chainId && session.data.accountAddress !== address
    );
    this.setSessions(sessions);

    return Promise.resolve();
  }

  private async getSessions(): Promise<CustomStorage.Sessions> {
    if (typeof this.storage === 'undefined') {
      throw new Error('storage not available');
    }

    const stringItem = await this.storage.getItem(this.key);

    return stringItem ?? [];
  }

  private setSessions(sessions: CustomStorage.Sessions): void {
    this.storage.setItem(this.key, sessions);
  }
}

export namespace CustomStorage {
  export type ConstructorParams = {
    /**
     * The key to save the sessions in the storage.
     */
    key?: string;
    storage: Storage;
  };

  export type Sessions = SIWXSession[];
}
