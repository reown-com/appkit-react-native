import { W3mFrameProvider, type W3mFrameTypes } from '@web3modal/email-react-native';

interface EmailProviderProps {
  projectId: string;
  metadata: W3mFrameTypes.Metadata;
}

export class EmailProvider extends W3mFrameProvider {
  constructor(props: EmailProviderProps) {
    super(props.projectId, props.metadata);
  }
}
