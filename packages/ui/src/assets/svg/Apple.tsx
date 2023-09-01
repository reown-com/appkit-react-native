import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgApple = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Apple_svg__a)">
      <Circle cx={20} cy={19.886} r={20} fill="#000" />
      <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
      <G clipPath="url(#Apple_svg__b)">
        <Path
          fill="#fff"
          d="M28.77 23.292c-.687 1.995-2.746 5.528-4.867 5.566-1.407.027-1.86-.834-3.468-.834-1.607 0-2.11.808-3.44.86-2.251.087-5.725-5.098-5.725-9.62 0-4.154 2.895-6.213 5.423-6.25 1.357-.025 2.638.914 3.465.914.83 0 2.386-1.129 4.021-.964.685.03 2.607.276 3.84 2.08-3.273 2.137-2.763 6.606.752 8.248ZM24.202 7.886c-2.473.1-4.49 2.694-4.209 4.84 2.286.177 4.479-2.385 4.21-4.84Z"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="Apple_svg__a">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
      <ClipPath id="Apple_svg__b">
        <Path fill="#fff" d="M8 7.886h24v24H8z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgApple;
