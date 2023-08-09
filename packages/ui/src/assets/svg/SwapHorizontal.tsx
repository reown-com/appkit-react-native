import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgSwapHorizontal = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 16 17" {...props}>
    <Path
      fill="#fff"
      fillRule="evenodd"
      d="M15.687 3.707a1 1 0 0 1 0 1.414l-3.415 3.415a1 1 0 1 1-1.414-1.415l1.707-1.707H6.103a1 1 0 0 1 0-2h6.463l-1.707-1.708A1 1 0 0 1 12.272.292l3.415 3.415Zm-4.805 7.878a1 1 0 0 1-1 1H3.418l1.708 1.707a1 1 0 0 1-1.414 1.414L.297 12.292a1 1 0 0 1 0-1.415l3.415-3.414a1 1 0 0 1 1.414 1.414l-1.708 1.707h6.464a1 1 0 0 1 1 1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgSwapHorizontal;
