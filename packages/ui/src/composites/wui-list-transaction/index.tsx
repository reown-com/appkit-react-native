import { type TransactionImage, type TransactionStatus } from '@reown/appkit-common-react-native';

import type { TransactionType } from '../../utils/TypesUtil';
import { Text } from '../../components/wui-text';
import { FlexView } from '../../layout/wui-flex';
import { IconBox } from '../wui-icon-box';
import { TransactionVisual } from '../wui-transaction-visual';
import { getIcon, getTypeLabel, getIconColor } from './utils';
import styles from './styles';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ListTransactionProps {
  date: string;
  status?: TransactionStatus;
  type?: TransactionType;
  descriptions?: string[];
  images?: TransactionImage[];
  networkSrc?: string;
  style?: StyleProp<ViewStyle>;
  isAllNFT?: boolean;
}

export function ListTransaction({
  date,
  type,
  descriptions,
  images,
  networkSrc,
  style,
  isAllNFT,
  status
}: ListTransactionProps) {
  const joinSymbol = type === 'trade' ? ' → ' : ' - ';

  return (
    <FlexView flexDirection="row" alignItems="center" style={style}>
      <TransactionVisual images={images} networkSrc={networkSrc} isAllNFT={isAllNFT} />
      <FlexView flexDirection="row" alignItems="center" style={styles.middleContainer}>
        <FlexView justifyContent="center" alignItems="flex-start">
          <FlexView flexDirection="row" alignItems="center">
            {type ? <IconBox
                icon={getIcon(type)}
                size="sm"
                iconColor={getIconColor(status)}
                background
                border
                borderColor="bg-100"
              /> : null}
            <Text variant="paragraph-500" color="fg-100">
              {getTypeLabel(type)}
            </Text>
          </FlexView>
          <Text variant="small-400" color="fg-200" numberOfLines={1} ellipsizeMode="tail">
            {descriptions?.join(joinSymbol)}
          </Text>
        </FlexView>
      </FlexView>
      <Text variant="micro-700" color="fg-300" style={styles.date}>
        {date}
      </Text>
    </FlexView>
  );
}
