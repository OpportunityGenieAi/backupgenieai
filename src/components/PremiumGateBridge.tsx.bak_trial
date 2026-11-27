import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PremiumGate } from '../api/premiumGate';
import { colors, fonts } from '../theme/colors';

// Name of the screen the user is looking at right now, even inside nested tabs.
function focusedRouteName(state: any): string {
  let name = '';
  let cur = state;
  while (cur && cur.routes) {
    const r = cur.routes[cur.index ?? 0];
    name = r?.name ?? name;
    cur = r?.state;
  }
  return name;
}

const TRIAL_DAYS = 3;
const PERKS = [
  'Scholarships matched to your profile',
  'Tracker to keep every application on course',
  'AI Advisor for your statement of purpose and motivation letters',
];

export default function PremiumGateBridge() {
  const navigation = useNavigation<any>();
  const [visible, setVisible] = useState(false);

  useEffect(
    () =>
      PremiumGate.subscribe(() => {
        const nav: any = navigation;
        const state = nav.getRootState ? nav.getRootState() : nav.getState?.();
        const name = focusedRouteName(state);
        if (!/match|tracker|advisor/i.test(name)) return; // only on Match, Tracker, Advisor
        setVisible(true);
      }),
    [navigation]
  );

  const close = () => setVisible(false);
  const go = () => {
    setVisible(false);
    navigation.navigate('Upgrade');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>OpportunityGenie Premium</Text>
          <Text style={styles.title}>Try Premium free for {TRIAL_DAYS} days</Text>
          <Text style={styles.sub}>
            Your scholarship journey, with everything unlocked. Take your time and see how it feels.
          </Text>

          <View style={styles.perks}>
            {PERKS.map((p) => (
              <View key={p} style={styles.perkRow}>
                <Text style={styles.tick}>✓</Text>
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.fine}>
            To begin, add your Google Play payment method. You pay nothing during the {TRIAL_DAYS}-day trial. After
            that, your subscription renews automatically at the price shown on the next screen. Cancel any time before
            the trial ends in Google Play, under Payments and subscriptions, and you won't be charged. Free trial is
            for first-time subscribers.
          </Text>

          <Pressable style={styles.primary} onPress={go}>
            <Text style={styles.primaryText}>Start my {TRIAL_DAYS}-day free trial</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={close}>
            <Text style={styles.secondaryText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: 20, padding: 22 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.blue, marginBottom: 6 },
  title: { fontFamily: fonts.extraBold, fontSize: 23, color: colors.ink, marginBottom: 8 },
  sub: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.inkSoft, lineHeight: 21, marginBottom: 14 },
  perks: { marginBottom: 12 },
  perkRow: { flexDirection: 'row', gap: 10, paddingVertical: 5 },
  tick: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.blue },
  perkText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink, flex: 1, lineHeight: 20 },
  fine: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkSoft, lineHeight: 16.5, marginBottom: 14 },
  primary: { backgroundColor: colors.blue, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  secondary: { paddingVertical: 12, alignItems: 'center' },
  secondaryText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.inkSoft },
});
