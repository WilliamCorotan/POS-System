import { Platform } from 'react-native';
import { colors } from './colors';

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  xs: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  
  sm: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.34,
      shadowRadius: 6.27,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.41,
      shadowRadius: 9.11,
    },
    android: {
      elevation: 9,
    },
    default: {},
  }),
};