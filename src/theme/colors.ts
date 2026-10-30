export const colors = {
  // Surfaces
  bg: '#F5F7FC',
  card: '#FFFFFF',
  white: '#FFFFFF',

  // Text
  ink: '#172554',
  inkSoft: '#64748B',
  inkFaint: '#94A3B8',

  // Brand
  blue: '#3157E8',
  blueDark: '#2441C4',
  blueTint: '#E6ECFD',
  teal: '#14B8A6',
  tealDark: '#0F8F82',
  tealTint: '#CCFBF1',
  navy: '#172554',

  // Lines and fills
  line: '#E3E8F4',
  pill: '#E9EEF8',
  grayTint: '#F1F4FA',

  // Status
  green: '#16A34A',
  greenTint: '#DCFCE7',
  amber: '#D97706',
  amberTint: '#FEF3C7',
  gold: '#B8860B',
  red: '#DC2626',
  redTint: '#FEE2E2',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

// Soft card shadow that works on both Android (elevation) and iOS.
export const shadow = {
  card: {
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

// Inter is used as the open-source substitute for SF Pro (Apple's system
// font can't be bundled outside Apple's own platforms). Loaded via
// @expo-google-fonts/inter — see App.tsx for the useFonts() call.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
};