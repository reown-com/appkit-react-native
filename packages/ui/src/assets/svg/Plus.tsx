import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgPlus = (props: SvgProps) => (
  <Svg viewBox="0 0 16 16" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M.282 8a1 1 0 0 1 1-1H7V1.282a1 1 0 1 1 2 0V7h5.717a1 1 0 1 1 0 2H9v5.717a1 1 0 1 1-2 0V9H1.282a1 1 0 0 1-1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgPlus;
