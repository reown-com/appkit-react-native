import Svg, { Circle, ClipPath, Defs, G, Path, Rect, type SvgProps } from 'react-native-svg';
const SvgProfile = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 60 60" {...props}>
    <G clipPath="url(#a)">
      <Rect width="60" height="60" fill="#00ACE6" rx="30" />
      <Path
        fill="#1AC6FF"
        stroke="#fff"
        strokeWidth="2"
        d="M59 73a29 29 0 1 1-58 0c0-16.02 11-29 29-29s29 12.98 29 29ZM18.7 19.9a11 11 0 0 1 9.27-8.69c1.35-.19 2.7-.19 4.06 0a11 11 0 0 1 9.28 8.7c.18.86.32 1.74.44 2.62a11 11 0 0 1 0 2.94c-.12.88-.26 1.76-.44 2.63a11 11 0 0 1-9.28 8.69c-1.35.18-2.7.18-4.06 0a11 11 0 0 1-9.28-8.7c-.18-.86-.32-1.74-.44-2.62a11 11 0 0 1 0-2.94c.12-.88.26-1.76.44-2.63Z"
      />
      <Circle cx="24.5" cy="23.5" r="1.5" fill="#fff" />
      <Circle cx="35.5" cy="23.5" r="1.5" fill="#fff" />
      <Path
        stroke="#fff"
        stroke-linecap="round"
        stroke-linejoin="round"
        strokeWidth="2"
        d="m31 20-3 8h4"
      />
    </G>
    <Rect width="59" height="59" x=".5" y=".5" stroke="#fff" strokeOpacity=".1" rx="29.5" />
    <Defs>
      <ClipPath id="a">
        <Rect width="60" height="60" fill="#fff" rx="30" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgProfile;
