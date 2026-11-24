import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  initConnection, fetchProducts, requestPurchase, finishTransaction,
  purchaseUpdatedListener, purchaseErrorListener,
} from 'expo-iap';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { CONSULT_PRODUCTS, ConsultSku, ConsultationsApi } from '../../api/consultations';

const SKUS = Object.keys(CONSULT_PRODUCTS) as ConsultSku[];
const tokenOf = (p: any): string | undefined => p?.purchaseToken ?? p?.purchaseTokenAndroid;

const STEPS = [
  { icon: 'card-outline', text: 'Choose your session and pay securely with Google Play.' },
  { icon: 'document-text-outline', text: 'Fill in a short form and attach your statement of purpose or any document.' },
  { icon: 'mail-outline', text: 'We email you meeting times. Reply to confirm what suits you.' },
] as const;

export default function ConsultationScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<ConsultSku>('consult_60min_v2');
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let upd: any; let err: any; let alive = true;
    (async () => {
      try {
        await initConnection();
        upd = purchaseUpdatedListener(async (purchase: any) => {
          if (!SKUS.includes(purchase?.productId)) return;
          try {
            const token = tokenOf(purchase);
            if (!token) throw new Error('No purchase token found.');
            const booking = await ConsultationsApi.verify(token, purchase.productId);
            await finishTransaction({ purchase, isConsumable: true });
            setBusy(false);
            navigation.replace('ConsultationForm', { id: booking.id });
          } catch (e: any) {
            setBusy(false);
            Alert.alert('We could not confirm your payment yet', String(e?.message ?? e) + '\n\nIf you were charged, reopen this screen in a minute. Your booking will be restored automatically.');
          }
        });
        err = purchaseErrorListener((e: any) => {
          setBusy(false);
          if (/cancel/i.test(`${e?.code ?? ''} ${e?.message ?? ''}`)) return;
          Alert.alert('Not available yet', /query product/i.test(String(e?.message)) ? 'Consultations are being activated on Google Play. Please try again in a little while.' : String(e?.message ?? 'Please try again.'));
        });
        const result: any[] = ((await fetchProducts({ skus: SKUS as string[], type: 'in-app' })) as any) ?? [];
        const map: Record<string, string> = {};
        result.forEach((p) => { if (p?.id ?? p?.productId) if (p.displayPrice) map[p.id ?? p.productId] = p.displayPrice; });
        if (alive) setPrices(map);
      } catch { /* the buttons still show the standard prices */ }
      if (alive) setReady(true);
    })();
    return () => { alive = false; upd?.remove?.(); err?.remove?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const price = (sku: ConsultSku) => prices[sku] ?? CONSULT_PRODUCTS[sku].fallbackPrice;

  const pay = async () => {
    setBusy(true);
    try {
      await requestPurchase({ type: 'in-app', request: { google: { skus: [selected] } } } as any);
    } catch (e: any) {
      setBusy(false);
      if (!/cancel/i.test(String(e?.message ?? ''))) Alert.alert('Not available yet', /query product/i.test(String(e?.message)) ? 'Consultations are being activated on Google Play. Please try again in a little while.' : String(e?.message ?? 'Please try again.'));
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
      <View style={s.hero}>
        <View style={s.avatar}><Ionicons name="school" size={32} color="#fff" /></View>
        <Text style={s.title}>Talk to a Scholar</Text>
        <Text style={s.sub}>Scholarship recipient: Erasmus Mundus</Text>
        <Text style={s.heroBody}>Personal guidance on scholarships, your application strategy and your statement of purpose.</Text>
      </View>

      <Text style={s.h}>Choose your session</Text>
      {SKUS.map((sku) => {
        const on = selected === sku;
        return (
          <Pressable key={sku} onPress={() => setSelected(sku)} style={[s.plan, on && s.planOn]}>
            <View style={[s.radio, on && s.radioOn]}>{on && <View style={s.dot} />}</View>
            <View style={{ flex: 1 }}>
              <Text style={s.planTitle}>{CONSULT_PRODUCTS[sku].label}</Text>
              <Text style={s.planSub}>One-to-one video session</Text>
            </View>
            <Text style={s.planPrice}>{price(sku)}</Text>
          </Pressable>
        );
      })}

      <Text style={[s.h, { marginTop: 22 }]}>How it works</Text>
      {STEPS.map((st, i) => (
        <View key={i} style={s.step}>
          <View style={s.stepIcon}><Ionicons name={st.icon} size={18} color={colors.blue} /></View>
          <Text style={s.stepText}>{st.text}</Text>
        </View>
      ))}

      <Pressable style={[s.pay, (busy || !ready) && { opacity: 0.6 }]} disabled={busy || !ready} onPress={pay}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.payText}>Pay {price(selected)} with Google Play</Text>}
      </Pressable>
      <Text style={s.fine}>One-time payment, not a subscription. Your details form opens right after payment.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.navy, borderRadius: radius.xl, padding: 22, alignItems: 'center', marginBottom: 22, ...shadow.card },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { fontFamily: fonts.extraBold, fontSize: 20, color: '#fff' },
  sub: { fontFamily: fonts.bold, fontSize: 13, color: colors.teal, marginTop: 3 },
  heroBody: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 19, marginTop: 10 },
  h: { fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink, marginBottom: 10 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.line, padding: 16, marginBottom: 10 },
  planOn: { borderColor: colors.blue, backgroundColor: colors.blueTint },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.inkFaint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.blue },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  planTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  planSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, marginTop: 1 },
  planPrice: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.blue },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.blueTint, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.ink, flex: 1, lineHeight: 19 },
  pay: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  payText: { fontFamily: fonts.bold, fontSize: 15, color: '#fff' },
  fine: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, textAlign: 'center', marginTop: 10, lineHeight: 16 },
});
