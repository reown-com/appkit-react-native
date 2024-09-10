import { W3mFrameProvider, type W3mFrameTypes } from '@reown/email-react-native';

interface EmailProviderProps {
  projectId: string;
  metadata: W3mFrameTypes.Metadata;
}

export class EmailProvider extends W3mFrameProvider {
  readonly id = 'w3mEmail';
  readonly name = 'AppKit Email';

  constructor(props: EmailProviderProps) {
    super(props.projectId, props.metadata);
  }
}
