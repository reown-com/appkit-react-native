import Svg, { G, Path, Defs, ClipPath, type SvgProps, Rect } from 'react-native-svg';
const SvgX = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#clip0_22845_4959)">
      <Rect width="40" height="40" fill="black" />
      <Path
        d="M21.8266 18.4604L28.9742 10.1519H27.2805L21.0742 17.366L16.1172 10.1519H10.4L17.8959 21.061L10.4 29.7738H12.0938L18.6479 22.1553L23.8827 29.7738H29.6L21.8266 18.4604ZM12.7042 11.427H15.3058L27.2813 28.5567H24.6796L12.7042 11.427Z"
        fill="white"
      />
    </G>
    <Path
      d="M0.5 20C0.5 9.23045 9.23045 0.5 20 0.5C30.7696 0.5 39.5 9.23045 39.5 20C39.5 30.7696 30.7696 39.5 20 39.5C9.23045 39.5 0.5 30.7696 0.5 20Z"
      stroke="white"
      strokeOpacity="0.05"
    />
    <Defs>
      <ClipPath id="clip0_22845_4959">
        <Path
          d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"
          fill="white"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgX;
