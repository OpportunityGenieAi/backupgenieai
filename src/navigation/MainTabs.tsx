import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import MatchScreen from '../screens/match/MatchScreen';
import TrackerScreen from '../screens/tracker/TrackerScreen';
import AdvisorHub from '../screens/advisor/AdvisorHub';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Android 15+ (target SDK 35/36) draws apps edge to edge, so the status bar sits on top of the
 * screen content. These tab screens have no header, so we leave room for the status bar here,
 * once, instead of in every screen.
 * HomeScreen is the exception: its header extends under the status bar and adds the inset itself.
 */
function withTopInset(Screen: React.ComponentType<any>) {
  function WithTopInset(props: any) {
    const insets = useSafeAreaInsets();
    return (
      <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.bg }}>
        <Screen {...props} />
      </View>
    );
  }
  WithTopInset.displayName = `WithTopInset(${Screen.displayName || Screen.name || 'Screen'})`;
  return WithTopInset;
}

const HomeTabScreen = HomeScreen;
const MatchTabScreen = withTopInset(MatchScreen);
const TrackerTabScreen = withTopInset(TrackerScreen);
const AdvisorTabScreen = withTopInset(AdvisorHub);
const ProfileTabScreen = withTopInset(ProfileScreen);

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home',
  MatchTab: 'flash',
  TrackerTab: 'list',
  AdvisorTab: 'chatbubble',
  ProfileTab: 'person',
};
const ICONS_OUTLINE: Record<string, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home-outline',
  MatchTab: 'flash-outline',
  TrackerTab: 'list-outline',
  AdvisorTab: 'chatbubble-outline',
  ProfileTab: 'person-outline',
};

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          height: 64 + bottomPad,
          paddingTop: 8,
          paddingBottom: bottomPad,
          elevation: 14,
          shadowColor: colors.navy,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12, marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const name = focused ? ICONS[route.name] : ICONS_OUTLINE[route.name];
          return (
            <View
              style={{
                paddingHorizontal: 18,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: focused ? colors.blueTint : 'transparent',
              }}
            >
              <Ionicons name={name} size={23} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeTabScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MatchTab" component={MatchTabScreen} options={{ title: 'Match' }} />
      <Tab.Screen name="TrackerTab" component={TrackerTabScreen} options={{ title: 'Tracker' }} />
      <Tab.Screen name="AdvisorTab" component={AdvisorTabScreen} options={{ title: 'Advisor' }} />
      <Tab.Screen name="ProfileTab" component={ProfileTabScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}