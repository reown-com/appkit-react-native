import type { Platform } from '@web3modal/core-react-native';
import { FlexView, Tabs } from '@web3modal/ui-react-native';

export interface ConnectingHeaderProps {
  platforms: Platform[];
  onSelectPlatform: (platform: Platform) => void;
}

export function ConnectingHeader({ platforms, onSelectPlatform }: ConnectingHeaderProps) {
  const generateTabs = () => {
    const tabs = platforms.map(platform => {
      if (platform === 'mobile') {
        return { label: 'Mobile', icon: 'mobile', platform: 'mobile' } as const;
      } else if (platform === 'web') {
        return { label: 'Web', icon: 'browser', platform: 'web' } as const;
      } else {
        return { label: 'QR Code', icon: 'qrCode', platform: 'qrcode' } as const;
      }
    });

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
      <Tabs tabs={tabs} onTabChange={onTabChange} />
    </FlexView>
  );
}
