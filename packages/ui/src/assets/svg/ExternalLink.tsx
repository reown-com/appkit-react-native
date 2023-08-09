import Svg, { Path, SvgProps } from 'react-native-svg';
const SvgExternalLink = (props: SvgProps) => (
  <Svg viewBox="0 0 21 20" fill="none" {...props}>
    <Path
      fill={props.fill || '#fff'}
      fillRule="evenodd"
      d="M5.774 4.286a1 1 0 0 1 1-1h8.944a1 1 0 0 1 1 1v8.944a1 1 0 1 1-2 0V6.7l-9.72 9.72a1 1 0 0 1-1.414-1.414l9.721-9.721h-6.53a1 1 0 0 1-1-1Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgExternalLink;
