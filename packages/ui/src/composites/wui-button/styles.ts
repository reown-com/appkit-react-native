import { StyleProp, StyleSheet } from "react-native";
import { ButtonType } from "../../utils/TypesUtil";

export const getThemedButtonStyle = (theme: {[key: string]: string}, variant: ButtonType ,disabled?: boolean, pressed?:boolean):StyleProp<any> => {
  switch (variant) {
    case 'fill':
      if(disabled){
        return {
          backgroundColor: theme['overlay-020'],
          borderColor: theme['overlay-005'],
        }
      } else if(pressed){
        return {
          backgroundColor: theme['blue-080'],
          borderColor: theme['overlay-010'],
        }
      }
      return {
        backgroundColor: theme['blue-100'],
        borderColor: theme['overlay-010'],
      }
    case 'accent':
      if(disabled){
        return {
          backgroundColor: theme['overlay-010'],
          borderColor: theme['overlay-005'],
        }
      } else if(pressed){
        return {
          backgroundColor: theme['overlay-010'],
          borderColor: theme['overlay-010'],
        }
      }
      return {
        backgroundColor: 'transparent',
        borderColor: theme['overlay-010'],
      }
  }
};

export const getThemedTextStyle = (theme: {[key: string]: string}, variant: ButtonType, disabled?: boolean):StyleProp<any> => {
  switch (variant) {
    case 'fill':
      if(disabled){
        return {
          color: theme['fg-300'],
        }
      }
      return {
        color: theme['inverse-100'],
      }
    case 'accent':
      if(disabled){
        return {
          color: theme['overlay-020'],
        }
      }
      return {
        color: theme['blue-100'],
      }
  }
};

export default StyleSheet.create({
  button: {
    height: 40,
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  smButton: {
    height: 32,
  },
  mdButton: {
    height: 40,
  },
})