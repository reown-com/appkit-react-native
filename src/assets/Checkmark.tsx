import Svg, { Path, SvgProps } from 'react-native-svg';

const SvgCheckmark = (props: SvgProps) => (
  <Svg width={14} height={12} viewBox="0 0 14 12" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M12.653.132a.75.75 0 0 1 .232 1.035L6.32 11.535a1 1 0 0 1-1.626.09L1.163 7.21a.75.75 0 0 1 1.17-.937l2.875 3.593a.25.25 0 0 0 .406-.023l6.004-9.48a.75.75 0 0 1 1.035-.232Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgCheckmark;
