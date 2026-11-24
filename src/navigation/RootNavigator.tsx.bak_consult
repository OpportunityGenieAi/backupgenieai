import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabs } from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import GpaConverterScreen from '../screens/profile/GpaConverterScreen';
import UpgradeScreen from '../screens/profile/UpgradeScreen';
import PremiumGateBridge from '../components/PremiumGateBridge';
import ScholarshipDetailScreen from '../screens/scholarship/ScholarshipDetailScreen';
import AdvisorChatScreen from '../screens/advisor/AdvisorChatScreen';
import { AdminScreen, ScholarshipFormScreen } from '../screens/admin/AdminScreen';
import AppSettingsScreen from '../screens/admin/AppSettingsScreen';
import { colors } from '../theme/colors';
import NotificationBridge from '../notifications/NotificationBridge';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <>
    <NotificationBridge />
    <PremiumGateBridge />
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Login" component={LoginScreen}
        options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="Signup" component={SignupScreen}
        options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="VerifyEmail" component={VerifyEmailScreen}
        options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="ForgotPassword" component={ForgotPasswordScreen}
        options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="ScholarshipDetail" component={ScholarshipDetailScreen}
        options={{ headerShown: true, title: 'Scholarship', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen
        name="AdvisorChat" component={AdvisorChatScreen}
        options={{ headerShown: true, title: 'Advisor chat', headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false }}
      />
      <Stack.Screen name="GpaConverter" component={GpaConverterScreen} />
      <Stack.Screen name="Upgrade" component={UpgradeScreen} options={{ headerShown: true, title: "Premium" }} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="ScholarshipForm" component={ScholarshipFormScreen} />
    </Stack.Navigator>
    </>
  );
}
