import Svg, { G, Circle, Path, Defs, ClipPath, type SvgProps } from 'react-native-svg';
const SvgTelegram = (props: SvgProps) => (
  <Svg viewBox="0 0 40 40" {...props} fill="none">
    <G clipPath="url(#Telegram_svg__a)">
      <G clipPath="url(#Telegram_svg__b)">
        <Circle cx={20} cy={19.886} r={20} fill="#1877F2" />
        <Circle cx={20} cy={19.886} r={19.5} stroke="#fff" strokeOpacity={0.1} />
        <Path
          fill="#fff"
          fillRule="evenodd"
          d="M24.546 28.087c.29.205.663.256.996.13.333-.127.578-.411.651-.756.782-3.675 2.68-12.978 3.392-16.322a.703.703 0 0 0-.234-.682.72.72 0 0 0-.718-.126c-3.773 1.397-15.395 5.757-20.145 7.515a.744.744 0 0 0-.488.719.745.745 0 0 0 .534.687c2.13.638 4.926 1.524 4.926 1.524s1.307 3.947 1.989 5.953c.085.252.282.45.542.519a.78.78 0 0 0 .73-.187l2.787-2.63s3.214 2.357 5.038 3.656Zm-9.91-7.81 1.512 4.985.336-3.157 9.166-8.267a.25.25 0 0 0 .03-.34.256.256 0 0 0-.339-.057l-10.704 6.836Z"
          clipRule="evenodd"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="Telegram_svg__a">
        <Path
          fill="#fff"
          d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20Z"
        />
      </ClipPath>
      <ClipPath id="Telegram_svg__b">
        <Path fill="#fff" d="M0 0h40v40H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgTelegram;
