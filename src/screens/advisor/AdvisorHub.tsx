import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import AdvisorScreen from './AdvisorScreen';
import { useShowAdOnFocus } from '../../hooks/useInterstitialAd';

/**
 * The Advisor tab: the existing recommendations screen, plus a bar that stays at the bottom so the
 * student can keep asking questions (or paste a statement of purpose) after the recommendations appear.
 */
export default function AdvisorHub() {
  const navigation = useNavigation<any>();
  useShowAdOnFocus();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AdvisorScreen />
      </View>

      <Pressable
        style={({ pressed }) => [styles.bar, pressed && { opacity: 0.92 }]}
        onPress={() => navigation.navigate('AdvisorChat')}
        accessibilityRole="button"
        accessibilityLabel="Chat with the advisor"
      >
        <View style={styles.barIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.blue} />
        </View>
        <Text style={styles.barText} numberOfLines={1}>Ask a question or paste your statement…</Text>
        <View style={styles.barSend}>
          <Ionicons name="arrow-up" size={18} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 12,
    paddingLeft: 8,
    paddingRight: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    ...shadow.card,
  },
  barIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center',
  },
  barText: { flex: 1, fontFamily: fonts.medium, fontSize: 13.5, color: colors.inkSoft },
  barSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});