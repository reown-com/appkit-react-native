import Svg, { Circle, ClipPath, Defs, G, Rect, type SvgProps } from 'react-native-svg';
const SvgNetwork = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <G clipPath="url(#a)">
      <Rect width="60" height="60" fill="#00ACE6" rx="30" />
      <Circle cx="64" cy="39" r="50" fill="#1AC6FF" stroke="#fff" strokeWidth="2" />
      <Circle cx="78" cy="30" r="50" fill="#4DD2FF" stroke="#fff" strokeWidth="2" />
      <Circle cx="72" cy="15" r="35" fill="#80DFFF" stroke="#fff" strokeWidth="2" />
      <Circle cx="34" cy="-17" r="45" stroke="#fff" strokeWidth="2" />
      <Circle cx="34" cy="-5" r="50" stroke="#fff" strokeWidth="2" />
      <Circle cx="30" cy="45" r="4" fill="#4DD2FF" stroke="#fff" strokeWidth="2" />
      <Circle cx="39.5" cy="27.5" r="4" fill="#80DFFF" stroke="#fff" strokeWidth="2" />
      <Circle cx="16" cy="24" r="4" fill="#19C6FF" stroke="#fff" strokeWidth="2" />
    </G>
    <Rect width="59" height="59" x=".5" y=".5" stroke="#062B2B" strokeOpacity=".1" rx="29.5" />
    <Defs>
      <ClipPath id="a">
        <Rect width="60" height="60" fill="#fff" rx="30" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgNetwork;
