import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import { colors, fonts } from './src/theme/colors';
import LaunchScreen from './src/components/LaunchScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PublicSettingsProvider } from './src/context/PublicSettingsContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { ScholarshipProvider } from './src/context/ScholarshipContext';
import { TrackerProvider } from './src/context/TrackerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import AppOpenManager from './src/hooks/useAppOpenAd';

// Shared links (https://opportunitygenie.org/s/<id>) open the scholarship inside the app.
// "Main" stays underneath so the back button leads to the home tabs.
const linking: LinkingOptions<any> = {
  prefixes: ['https://opportunitygenie.org'],
  config: {
    initialRouteName: 'Main',
    screens: {
      ScholarshipDetail: 's/:id',
    },
  },
};

function SessionGate({ children }: { children: React.ReactNode }) {
  const { restoreSession, loading } = useAuth();
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <LaunchScreen />;
  }
  return <>{children}</>;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });
  const [introFinished, setIntroFinished] = useState(false);
  useEffect(() => {
    // keep the launch screen up for at least 1.8s so it never just flashes
    const t = setTimeout(() => setIntroFinished(true), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!fontsLoaded) {
    return <LaunchScreen />;
  }

  return (
    <PublicSettingsProvider>
      <AuthProvider>
        <ProfileProvider>
          <ScholarshipProvider>
            <TrackerProvider>
              <SessionGate>
                <NavigationContainer linking={linking}>
                  <StatusBar style="dark" />
                  <AppOpenManager />
                  <RootNavigator />
                </NavigationContainer>
              </SessionGate>
              {!introFinished && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                  <LaunchScreen />
                </View>
              )}
            </TrackerProvider>
          </ScholarshipProvider>
        </ProfileProvider>
      </AuthProvider>
    </PublicSettingsProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg },
});