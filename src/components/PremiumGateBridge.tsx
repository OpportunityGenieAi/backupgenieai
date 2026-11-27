import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PremiumGate } from '../api/premiumGate';
import { TrialDetails, trialDetails } from '../api/trialInfo';
import { fonts } from '../theme/colors';

// Only these areas of the app should ever ask the user to pay.
const GATED = /match|tracker|advisor/i;

/** Names of every screen currently open, from the outer navigator down to the focused tab, e.g. "Main/Tabs/Match". */
function openScreens(state: any): string {
  const names: string[] = [];
  let s = state;
  while (s && s.routes) {
    const r = s.routes[s.index ?? 0];
    if (r?.name) names.push(String(r.name));
    s = r?.state;
  }
  return names.join('/');
}

export default function PremiumGateBridge() {
  const navigation = useNavigation<any>();
  const pending = useRef(false); // a Premium-only request failed while the user was somewhere else (e.g. Home)
  const open = useRef(false);
  const [trial, setTrial] = useState<TrialDetails | null>(null);

  const close = () => { open.current = false; setTrial(null); };
  const start = () => { close(); navigation.navigate('Upgrade'); };

  useEffect(() => {
    const onGatedScreen = (state?: any) => GATED.test(openScreens(state ?? navigation.getState?.()));

    const show = async () => {
      if (open.current) return;
      open.current = true;
      pending.current = false;
      const t = await trialDetails();
      if (t) {
        setTrial(t); // welcoming free-trial pop-up (rendered below)
        return;
      }
      Alert.alert(
        'Premium feature',
        'Match, Tracker and the AI Advisor are part of OpportunityGenie Premium. Upgrade to unlock personalized AI guidance and tools.',
        [
          { text: 'Not now', style: 'cancel', onPress: () => { open.current = false; } },
          { text: 'Upgrade', onPress: () => { open.current = false; navigation.navigate('Upgrade'); } },
        ],
        { cancelable: true, onDismiss: () => { open.current = false; } },
      );
    };

    // A Premium-only request failed: ask now only if the user is on Match, Tracker or Advisor.
    const unsubGate = PremiumGate.subscribe(() => {
      if (onGatedScreen()) show();
      else pending.current = true; // remember it, and ask later if they open one of those tabs
    });

    // The user moved to another screen.
    const unsubNav = navigation.addListener?.('state', (e: any) => {
      if (pending.current && onGatedScreen(e?.data?.state)) show();
    });

    return () => {
      unsubGate?.();
      unsubNav?.();
    };
  }, [navigation]);

  return (
    <Modal visible={!!trial} transparent animationType="fade" onRequestClose={close}>
      <View style={s.overlay}>
        <View style={s.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22 }}>
            <View style={s.pill}><Text style={s.pillText}>{trial?.days ?? 3} DAYS FREE</Text></View>
            <Text style={s.title}>Find Scholarships You Have a Better Chance of Winning!</Text>
            <Text style={s.sub}>Unlock OpportunityGenie Premium and get the tools to pursue the right opportunities.</Text>
            <View style={s.rule} />

            <Text style={s.bullet}>
              <Text style={s.bold}>Best Match Score: </Text>Identify scholarships where your academic profile may give you a stronger chance.
            </Text>
            <Text style={s.bullet}>
              <Text style={s.bold}>AI Advisor: </Text>Get personalized guidance to help you understand eligibility and strengthen your applications.
            </Text>
            <Text style={s.bullet}>
              <Text style={s.bold}>Application Tracker: </Text>Organize your scholarship applications and keep track of deadlines.
            </Text>

            <View style={s.offer}>
              <Text style={s.offerTitle}>TRY PREMIUM FREE FOR {trial?.days ?? 3} DAYS</Text>
              <Text style={s.offerBody}>
                Go Premium now, discover scholarships that match your profile, and take a smarter step towards winning your dream scholarship.
              </Text>
            </View>

            <Pressable style={({ pressed }) => [s.cta, pressed && { opacity: 0.88 }]} onPress={start}>
              <Text style={s.ctaText}>START MY FREE TRIAL</Text>
            </Pressable>
            <Pressable onPress={close} style={s.later} hitSlop={8}>
              <Text style={s.laterText}>Maybe Later</Text>
            </Pressable>

            <Text style={s.legal}>
              After your {trial?.days ?? 3}-day free trial, your subscription renews at {trial?.price} per {trial?.period}. Cancel before the trial ends to avoid being charged.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const NAVY = '#16294A';
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,12,28,0.72)', justifyContent: 'center', padding: 18 },
  card: { backgroundColor: NAVY, borderRadius: 22, maxHeight: '92%', overflow: 'hidden' },
  pill: { alignSelf: 'center', backgroundColor: 'rgba(52,199,120,0.16)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 14, marginBottom: 14 },
  pillText: { fontFamily: fonts.extraBold, fontSize: 12, letterSpacing: 0.6, color: '#3DDC97' },
  title: { fontFamily: fonts.extraBold, fontSize: 23, lineHeight: 29, color: '#fff', textAlign: 'center' },
  sub: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: '#E6EEFB', textAlign: 'center', marginTop: 10 },
  rule: { height: 1, backgroundColor: 'rgba(255,255,255,0.14)', marginVertical: 18 },
  bullet: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: '#DCE6F6', marginBottom: 12 },
  bold: { fontFamily: fonts.extraBold, color: '#fff' },
  offer: { backgroundColor: '#1F3A5F', borderRadius: 14, padding: 16, marginTop: 8 },
  offerTitle: { fontFamily: fonts.extraBold, fontSize: 16, color: '#fff', textAlign: 'center' },
  offerBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: '#D5E2F5', textAlign: 'center', marginTop: 6 },
  cta: { backgroundColor: '#8EE0D2', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  ctaText: { fontFamily: fonts.extraBold, fontSize: 15.5, letterSpacing: 0.4, color: NAVY },
  later: { alignSelf: 'center', paddingVertical: 14 },
  laterText: { fontFamily: fonts.bold, fontSize: 14, color: '#C9D8EF' },
  legal: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 17, color: '#9FB2D1', textAlign: 'center' },
});
