import type { Platform } from '@reown/appkit-common-react-native';
import { FlexView, Tabs, type IconType } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export interface ConnectingHeaderProps {
  platforms: Platform[];
  onSelectPlatform: (platform: Platform) => void;
}

interface Tab {
  label: string;
  icon: IconType;
  platform: Platform;
}

export function ConnectingHeader({ platforms, onSelectPlatform }: ConnectingHeaderProps) {
  const generateTabs = () => {
    const tabs = platforms
      .map(platform => {
        if (platform === 'mobile') {
          return { label: 'Mobile', icon: 'mobile', platform: 'mobile' } as const;
        } else if (platform === 'web') {
          return { label: 'Web', icon: 'browser', platform: 'web' } as const;
        } else {
          return undefined;
        }
      })
      .filter(Boolean) as Tab[];

    return tabs;
  };

  const onTabChange = (index: number) => {
    const platform = platforms[index];
    if (platform) {
      onSelectPlatform(platform);
    }
  };

  const tabs = generateTabs();

  return (
    <FlexView alignItems="center" padding={['xs', '0', '0', '0']}>
      <Tabs tabs={tabs} onTabChange={onTabChange} style={styles.tab} />
    </FlexView>
  );
}

const styles = StyleSheet.create({
  tab: {
    maxWidth: '50%'
  }
});
