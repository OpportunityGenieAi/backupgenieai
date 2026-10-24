import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../../theme/colors';
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
        style={styles.bar}
        onPress={() => navigation.navigate('AdvisorChat')}
        accessibilityRole="button"
        accessibilityLabel="Chat with the advisor"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.blue} />
        <Text style={styles.barText}>Ask a question or paste your statement…</Text>
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
    marginHorizontal: 14,
    marginTop: 6,
    marginBottom: 10,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.blue,
    borderRadius: 26,
  },
  barText: { flex: 1, fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft },
  barSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
