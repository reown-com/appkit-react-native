import type { IconType } from '../../utils/TypesUtil';
import { FlexView } from '../../layout/wui-flex';
import { IconBox } from '../wui-icon-box';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface BannerProps {
  icon: IconType;
  text: string;
}

export function Banner({ icon, text }: BannerProps) {
  const Theme = useTheme();

  return (
    <FlexView
      flexDirection="row"
      alignItems="center"
      style={[styles.container, { backgroundColor: Theme['accent-glass-010'] }]}
    >
      <IconBox icon={icon} size="sm" iconColor="fg-200" background style={styles.icon} />
      <Text variant="small-400" color="fg-200" style={styles.text}>
        {text}
      </Text>
    </FlexView>
  );
}
