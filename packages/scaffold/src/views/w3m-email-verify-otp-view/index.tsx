import { useState, type RefObject, useEffect, useCallback } from 'react';
import type WebView from 'react-native-webview';
import { FlexView, LoadingSpinner, Otp, Text } from '@web3modal/ui-react-native';
import { verifyOtp } from '../../modal/w3m-modal/FrameSdk';
import styles from './styles';

interface EmailVerifyOtpViewProps {
  webviewRef: RefObject<WebView>;
}

export function EmailVerifyOtpView({ webviewRef }: EmailVerifyOtpViewProps) {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onOtpSubmit = useCallback(() => {
    const message = verifyOtp(otp);
    webviewRef?.current?.injectJavaScript(message);
    setLoading(true);
  }, [otp, webviewRef]);

  useEffect(() => {
    if (otp.length === 6) {
      onOtpSubmit();
    }
  }, [onOtpSubmit, otp]);

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
      <Text variant="paragraph-500">Enter the code we sent to your email</Text>
      <Text style={styles.expiryText} variant="small-400" color="fg-200">
        The code expires in 10 minutes
      </Text>
      <FlexView justifyContent="center" alignItems="center" style={styles.otpContainer}>
        {loading ? <LoadingSpinner /> : <Otp length={6} onChangeText={setOtp} />}
      </FlexView>
    </FlexView>
  );
}
