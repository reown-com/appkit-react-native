import { View, type StyleProp, type ViewStyle } from 'react-native';

import type {
  FlexAlignType,
  FlexDirectionType,
  FlexGrowType,
  FlexJustifyContentType,
  FlexShrinkType,
  FlexWrapType,
  SpacingType
} from '../../utils/TypesUtil';

import { UiUtil } from '../../utils/UiUtil';

export interface FlexViewProps {
  children?: React.ReactNode;
  flexDirection?: FlexDirectionType;
  flexWrap?: FlexWrapType;
  flexGrow?: FlexGrowType;
  flexShrink?: FlexShrinkType;
  alignItems?: FlexAlignType;
  alignSelf?: FlexAlignType;
  justifyContent?: FlexJustifyContentType;
  padding?: SpacingType | SpacingType[];
  margin?: SpacingType | SpacingType[];
  style?: StyleProp<ViewStyle>;
}

export function FlexView(props: FlexViewProps) {
  const styles: ViewStyle = {
    flexDirection: props.flexDirection,
    flexWrap: props.flexWrap,
    flexGrow: props.flexGrow,
    flexShrink: props.flexShrink,
    alignItems: props.alignItems,
    alignSelf: props.alignSelf,
    justifyContent: props.justifyContent,
    paddingTop: props.padding && UiUtil.getSpacingStyles(props.padding, 0),
    paddingRight: props.padding && UiUtil.getSpacingStyles(props.padding, 1),
    paddingBottom: props.padding && UiUtil.getSpacingStyles(props.padding, 2),
    paddingLeft: props.padding && UiUtil.getSpacingStyles(props.padding, 3),
    marginTop: props.margin && UiUtil.getSpacingStyles(props.margin, 0),
    marginRight: props.margin && UiUtil.getSpacingStyles(props.margin, 1),
    marginBottom: props.margin && UiUtil.getSpacingStyles(props.margin, 2),
    marginLeft: props.margin && UiUtil.getSpacingStyles(props.margin, 3)
  };

  return <View style={[styles, props.style]}>{props.children}</View>;
}
