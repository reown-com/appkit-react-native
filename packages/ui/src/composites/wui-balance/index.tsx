import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';
import { Text } from '../../components/wui-text';

export interface BalanceProps {
  integer?: string;
  decimal?: string;
}

export function Balance({ integer = '0', decimal = '00' }: BalanceProps) {
  const decimalSeparator = useMemo(() => {
    return NumberUtil.getLocaleDecimalSeparator();
  }, []);

  return (
    <Text color="fg-100" style={styles.text}>
      {`$${integer}`}
      <Text color="fg-200" style={styles.text}>
        {`${decimalSeparator}${decimal}`}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 40,
    fontWeight: '500'
  }
});
