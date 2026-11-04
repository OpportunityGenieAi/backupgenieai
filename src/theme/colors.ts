export const colors = {
  // Surfaces
  bg: '#EFF4F4',
  card: '#FFFFFF',
  white: '#FFFFFF',

  // Text
  ink: '#0F2A3D',
  inkSoft: '#566B7A',
  inkFaint: '#8A9AA6',

  // Brand: blues taken from the reference screenshot.
  blue: '#0071BB',
  blueDark: '#005A96',
  blueTint: '#CCE7F6',
  teal: '#029BDA',        // bright sky blue (name kept so existing screens keep working)
  tealDark: '#0376BD',
  tealTint: '#DDF0FA',
  navy: '#0B3A5E',

  // Warm accent for highlights (the selected region chip)
  accent: '#F14C36',
  accentTint: '#FDE3DF',

  // Lines and fills
  line: '#DDE6EC',
  pill: '#E3ECF1',
  grayTint: '#F1F5F7',

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
    shadowColor: '#0B3A5E',
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
