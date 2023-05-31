import { StyleProp, Text, TextStyle, useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

function Web3Text({ children, style }: Props) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <Text
      style={[
        {
          color: isDarkMode ? DarkTheme.foreground1 : LightTheme.foreground1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export default Web3Text;
