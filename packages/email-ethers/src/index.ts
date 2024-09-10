import { AppKitFrameProvider, type AppKitFrameTypes } from '@reown/email-react-native';

interface EmailProviderProps {
  projectId: string;
  metadata: AppKitFrameTypes.Metadata;
}

export class EmailProvider extends AppKitFrameProvider {
  readonly id = 'w3mEmail';
  readonly name = 'AppKit Email';

  constructor(props: EmailProviderProps) {
    super(props.projectId, props.metadata);
  }
}
