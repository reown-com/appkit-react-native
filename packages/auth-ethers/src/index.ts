import { AppKitFrameProvider, type AppKitFrameTypes } from '@reown/appkit-wallet-react-native';

interface AuthProviderProps {
  projectId: string;
  metadata: AppKitFrameTypes.Metadata;
}

export class AuthProvider extends AppKitFrameProvider {
  readonly id = 'appKitAuth';
  readonly name = 'AppKit Auth';

  constructor(props: AuthProviderProps) {
    super(props.projectId, props.metadata);
  }
}
