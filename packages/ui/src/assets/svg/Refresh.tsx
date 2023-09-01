import Svg, { Path, type SvgProps } from 'react-native-svg';
const SvgRefresh = (props: SvgProps) => (
  <Svg viewBox="0 0 14 15" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M10.06 1.03a1 1 0 0 0-.7 1.23l.48 1.68a5.85 5.85 0 1 0 2.88 6.88 1 1 0 1 0-1.92-.58 3.86 3.86 0 1 1-1.82-4.49l-1.87.53a1 1 0 0 0 .55 1.92l4.1-1.15a1 1 0 0 0 .69-1.23l-1.16-4.1a1 1 0 0 0-1.23-.7Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgRefresh;
