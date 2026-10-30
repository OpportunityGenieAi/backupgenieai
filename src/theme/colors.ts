export const colors = {
  // Surfaces
  bg: '#F3F5FB',
  card: '#FFFFFF',
  white: '#FFFFFF',

  // Text
  ink: '#12332E',
  inkSoft: '#5B6B73',
  inkFaint: '#8A98A0',

  // Brand (the name "blue" now holds the deep teal from your reference photo)
  blue: '#1F8A7A',
  blueDark: '#176B5F',
  blueTint: '#D8F0EA',
  teal: '#2FB8A0',
  tealDark: '#176B5F',
  tealTint: '#D8F0EA',
  navy: '#12423B',

  // Lines and fills
  line: '#E3E8F2',
  pill: '#E4ECEA',
  grayTint: '#F1F4F7',

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
    shadowColor: '#12423B',
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