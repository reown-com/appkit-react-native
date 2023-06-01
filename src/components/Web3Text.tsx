import { StyleProp, Text, TextStyle, useColorScheme } from 'react-native';

import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

function Web3Text({ children, style }: Props) {
  const Theme = useColorScheme() === 'dark' ? DarkTheme : LightTheme;
  return <Text style={[{ color: Theme.foreground1 }, style]}>{children}</Text>;
}

export default Web3Text;
