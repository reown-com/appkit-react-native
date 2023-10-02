import { LayoutAnimation } from 'react-native';

export const UiUtil = {
  createViewTransition: () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  }
};
