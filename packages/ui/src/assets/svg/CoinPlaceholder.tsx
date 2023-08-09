import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgCoinPlaceholder = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M10.005 3a7 7 0 0 0-6.852 8.438l8.29-8.29A7.033 7.033 0 0 0 10.005 3Zm3.486.928-9.557 9.558c.319.554.711 1.06 1.165 1.506l9.899-9.899a7.027 7.027 0 0 0-1.507-1.165Zm2.703 2.797L6.731 16.19c.977.518 2.09.811 3.274.811a6.997 6.997 0 0 0 7-7 6.966 6.966 0 0 0-.81-3.275ZM1.988 5.907A9 9 0 0 1 10.005 1a8.987 8.987 0 0 1 7.152 3.535A8.965 8.965 0 0 1 19.005 10a8.997 8.997 0 0 1-9 9c-2.054 0-3.95-.69-5.465-1.849a9.04 9.04 0 0 1-2.354-2.693A8.964 8.964 0 0 1 1.006 10a8.96 8.96 0 0 1 .982-4.093Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgCoinPlaceholder;
