import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgArrowRight = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M.997 7.986a1 1 0 0 1 1-1h7.586l-2.46-2.46A1 1 0 1 1 8.537 3.11l4.168 4.168a1 1 0 0 1 0 1.414L8.537 12.86a1 1 0 1 1-1.414-1.415l2.46-2.46H1.998a1 1 0 0 1-1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgArrowRight;
