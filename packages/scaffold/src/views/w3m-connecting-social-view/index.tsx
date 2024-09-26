import { useCallback, useEffect, useState } from 'react';
import { RouterController } from '@reown/appkit-core-react-native';
import { FlexView, LoadingThumbnail, IconBox, Logo, Text } from '@reown/appkit-ui-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingSocialView() {
  const { data } = RouterController.state;
  const { maxWidth: width } = useCustomDimensions();
  const [error, setError] = useState<string>();
  const provider = data?.socialProvider;

  const onConnect = useCallback(async () => {}, []);

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  return (
    <FlexView
      alignItems="center"
      alignSelf="center"
      padding={['2xl', 'l', '3xl', 'l']}
      style={{ width }}
    >
      <LoadingThumbnail paused={!!error}>
        <Logo logo={provider ?? 'more'} height={72} width={72} />
        {error && (
          <IconBox
            icon={'close'}
            border
            background
            backgroundColor="icon-box-bg-error-100"
            size="sm"
            iconColor="error-100"
            style={styles.errorIcon}
          />
        )}
      </LoadingThumbnail>
      <Text style={styles.continueText} variant="paragraph-500">
        {`Continue with ${StringUtil.capitalize(provider)}`}
      </Text>
      <Text variant="small-400" color="fg-200">
        Connect in the provider window
      </Text>
    </FlexView>
  );
}
