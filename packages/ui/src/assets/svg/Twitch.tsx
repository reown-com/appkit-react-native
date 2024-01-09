import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgTwitch = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Twitch_svg__a)">
      <G clipPath="url(#Twitch_svg__b)">
        <Circle cx={20} cy={19.886} r={20} fill="#5A3E85" />
        <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
        <G clipPath="url(#Twitch_svg__c)">
          <Path
            fill="#fff"
            d="M18.224 25.692 20 23.916h3.343l2.09-2.09V15.14h-10.03v8.776h2.821v1.776Zm3.866-8.15h1.254v3.654H22.09v-3.653Zm-3.344 0H20v3.654h-1.254v-3.653ZM20 7.887c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12Zm6.687 14.567L23.03 26.11h-2.716l-1.777 1.776h-1.88V26.11h-3.344v-9.821l.941-2.403h12.433v8.567Z"
          />
        </G>
      </G>
    </G>
    <Defs>
      <ClipPath id="Twitch_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Twitch_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
      <ClipPath id="Twitch_svg__c">
        <Path fill="#fff" d="M8 7.886h24v24H8z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgTwitch;
