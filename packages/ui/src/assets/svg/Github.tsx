import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgGithub = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Github_svg__a)">
      <G clipPath="url(#Github_svg__b)">
        <Circle cx={20} cy={19.886} r={20} fill="#1B1F23" />
        <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
        <G clipPath="url(#Github_svg__c)">
          <Path
            fill="#fff"
            d="M8 19.886c0-6.627 5.374-12 12-12 6.627 0 12 5.373 12 12 0 5.3-3.434 9.797-8.199 11.386-.609.118-.801-.257-.801-.576v-3.293c0-1.12-.393-1.85-.823-2.222 2.672-.297 5.479-1.312 5.479-5.921 0-1.31-.465-2.381-1.235-3.221.124-.302.535-1.523-.118-3.176 0 0-1.006-.322-3.297 1.23A11.543 11.543 0 0 0 20 13.689c-1.02.005-2.046.138-3.003.404-2.293-1.552-3.301-1.23-3.301-1.23-.652 1.652-.241 2.873-.117 3.176-.767.84-1.236 1.91-1.236 3.22 0 4.598 2.802 5.627 5.467 5.932-.344.299-.655.829-.762 1.604-.685.307-2.422.837-3.492-.997 0 0-.634-1.153-1.839-1.237 0 0-1.172-.016-.083.729 0 0 .787.369 1.333 1.756 0 0 .695 2.142 4.033 1.416v2.234c0 .316-.194.688-.793.577C11.438 29.686 8 25.188 8 19.886Z"
          />
        </G>
      </G>
    </G>
    <Defs>
      <ClipPath id="Github_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Github_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
      <ClipPath id="Github_svg__c">
        <Path fill="#fff" d="M8 7.886h24v24H8z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgGithub;
