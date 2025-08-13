import { Linking, type StyleProp, type ViewStyle } from 'react-native';
import { ConstantsUtil } from '@reown/appkit-common-react-native';
import { FlexView, Icon, Pressable, Text } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function ReownButton({ style }: Props) {
  return (
    <Pressable transparent onPress={() => Linking.openURL(ConstantsUtil.REOWN_URL)} style={style}>
      <FlexView alignItems="center" justifyContent="center" flexDirection="row" columnGap="2xs">
        <Text variant="small-500" color="fg-100">
          UX by
        </Text>
        <Icon name="reown" color="fg-150" width={100} height={30} />
      </FlexView>
    </Pressable>
  );
}
