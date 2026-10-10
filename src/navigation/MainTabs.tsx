import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import MatchScreen from '../screens/match/MatchScreen';
import TrackerScreen from '../screens/tracker/TrackerScreen';
import AdvisorScreen from '../screens/advisor/AdvisorScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Android 15+ (target SDK 35/36) draws apps edge to edge, so the status bar sits on top of the
 * screen content. These tab screens have no header, so we leave room for the status bar here,
 * once, instead of in every screen.
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

const HomeTabScreen = withTopInset(HomeScreen);
const MatchTabScreen = withTopInset(MatchScreen);
const TrackerTabScreen = withTopInset(TrackerScreen);
const AdvisorTabScreen = withTopInset(AdvisorScreen);
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
  return (
    <Tab.Navigator id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.line },
        tabBarIcon: ({ focused, color, size }) => {
          const name = focused ? ICONS[route.name] : ICONS_OUTLINE[route.name];
          return <Ionicons name={name} size={size} color={color} />;
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
