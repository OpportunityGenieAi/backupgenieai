import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PremiumGate } from '../api/premiumGate';
import { trialAvailable } from '../api/trialInfo';

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

  useEffect(() => {
    const onGatedScreen = (state?: any) => GATED.test(openScreens(state ?? navigation.getState?.()));

    const show = async () => {
      if (open.current) return;
      open.current = true;
      pending.current = false;
      const trial = await trialAvailable();
      Alert.alert(
        trial ? 'Try Premium free for 3 days' : 'Premium feature',
        trial
          ? "Welcome! Match, Tracker and the AI Advisor are part of OpportunityGenie Premium.\n\nStart your 3-day free trial and enjoy everything on us. You'll add your Google Play payment method now, and your first payment is only taken after the 3 days. Cancel anytime before then and you won't be charged."
          : 'Match, Tracker and the AI Advisor are part of OpportunityGenie Premium. Upgrade to unlock personalized AI guidance and tools.',
        [
          { text: 'Maybe later', style: 'cancel', onPress: () => { open.current = false; } },
          { text: trial ? 'Start free trial' : 'Upgrade', onPress: () => { open.current = false; navigation.navigate('Upgrade'); } },
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

  return null;
}
