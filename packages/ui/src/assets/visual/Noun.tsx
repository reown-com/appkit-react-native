import Svg, { Path, Rect, type SvgProps } from 'react-native-svg';
const SvgNoun = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <Rect width="60" height="60" fill="#794CFF" rx="3" />
    <Path
      fill="#987DE8"
      stroke="#fff"
      strokeWidth="2"
      d="M33 22.5v-1H16v5H8.5V36H13v-5h3v7.5h17V31h1v7.5h17v-17H34v5h-1v-4Z"
    />
    <Path fill="#fff" d="M37.5 25h10v10h-10z" />
    <Path fill="#4019B2" d="M42.5 25h5v10h-5z" />
    <Path fill="#fff" d="M19.5 25h10v10h-10z" />
    <Path fill="#4019B2" d="M24.5 25h5v10h-5z" />
    <Path fill="#fff" d="M12 30.5h4V37h-4v-6.5Z" />
    <Rect width="59" height="59" x=".5" y=".5" stroke="#fff" strokeOpacity=".1" rx="2.5" />
  </Svg>
);
export default SvgNoun;
