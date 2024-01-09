import { LayoutAnimation } from 'react-native';

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  createViewTransition: () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  }
};
