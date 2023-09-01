import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgTwitter = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Twitter_svg__a)">
      <G clipPath="url(#Twitter_svg__b)">
        <Circle cx={20} cy={19.886} r={20} fill="#1D9BF0" />
        <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
        <Path
          fill="#fff"
          d="M30 13.81a8.189 8.189 0 0 1-2.357.646 4.11 4.11 0 0 0 1.805-2.27 8.22 8.22 0 0 1-2.606.996 4.096 4.096 0 0 0-2.995-1.296c-2.65 0-4.596 2.471-3.998 5.037a11.648 11.648 0 0 1-8.457-4.286 4.109 4.109 0 0 0 1.27 5.478 4.086 4.086 0 0 1-1.858-.513c-.045 1.9 1.318 3.679 3.291 4.075a4.114 4.114 0 0 1-1.853.07 4.106 4.106 0 0 0 3.833 2.849 8.25 8.25 0 0 1-6.075 1.7 11.616 11.616 0 0 0 6.29 1.843c7.618 0 11.922-6.434 11.663-12.205A8.354 8.354 0 0 0 30 13.81Z"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="Twitter_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Twitter_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgTwitter;
