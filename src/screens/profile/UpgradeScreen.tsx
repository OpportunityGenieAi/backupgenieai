import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  initConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'expo-iap';
import { SubscriptionApi } from '../../api/subscription';
import { colors, fonts, radius, shadow } from '../../theme/colors';
import { bestOffer, offerTokenOf, trialDays } from '../../api/trialInfo';

const MONTHLY_ID = 'premium_monthly';
const ANNUAL_ID = 'premium_annual';
const ALL_IDS = [MONTHLY_ID, ANNUAL_ID];

type PlanKey = 'monthly' | 'annual';

const PLANS: Record<PlanKey, { id: string; name: string; fallbackPrice: string; per: string; blurb: string }> = {
  monthly: {
    id: MONTHLY_ID,
    name: 'Monthly Plan',
    fallbackPrice: '$2.00',
    per: 'month',
    blurb: 'Enjoy Premium access with flexible monthly billing.',
  },
  annual: {
    id: ANNUAL_ID,
    name: 'Annual Plan',
    fallbackPrice: '$19.00',
    per: 'year',
    blurb: 'Get a full year of Premium access and save $5 compared with paying monthly.',
  },
};

const BENEFITS = [
  'Get personalized AI scholarship guidance.',
  'Access scholarship opportunities that match your academic profile.',
  'Get help understanding eligibility requirements.',
  'Organize and track your scholarship applications.',
  'Access enhanced academic support tools.',
];

function tokenOf(purchase: any): string | undefined {
  return purchase?.purchaseToken ?? purchase?.purchaseTokenAndroid;
}

function skuOf(product: any): string | undefined {
  return product?.id ?? product?.productId ?? product?.sku;
}

async function verifyOnServer(purchase: any): Promise<boolean> {
  const token = tokenOf(purchase);
  if (!token) throw new Error('No purchase token found on this purchase.');
  const status = await SubscriptionApi.verify(token, purchase?.productId);
  return !!status.premium;
}

export default function UpgradeScreen() {
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let updateSub: any;
    let errorSub: any;

    (async () => {
      try {
        await initConnection();

        updateSub = purchaseUpdatedListener(async (purchase: any) => {
          try {
            if (await verifyOnServer(purchase)) {
              await finishTransaction({ purchase, isConsumable: false });
              Alert.alert('Subscribed', 'Premium is now active.');
            } else {
              Alert.alert('Not active yet', 'Google has not confirmed this payment yet. Try Restore purchase in a minute.');
            }
          } catch (e: any) {
            Alert.alert('Verification failed', String(e?.message ?? e));
          }
        });

        errorSub = purchaseErrorListener((err: any) => {
          const code = String(err?.code ?? '');
          if (code.toLowerCase().includes('cancel')) return; // user closed the Google Play sheet
          Alert.alert('Purchase error', `${code} ${err?.message ?? ''}`.trim());
        });

        const result: any[] = ((await fetchProducts({ skus: ALL_IDS, type: 'subs' })) as any) ?? [];
        const map: Record<string, any> = {};
        for (const p of result) {
          const id = skuOf(p);
          if (id) map[id] = p;
        }
        setProducts(map);
        // default to the annual plan when it exists, otherwise whatever is available
        if (!map[ANNUAL_ID] && map[MONTHLY_ID]) setSelected('monthly');
      } catch (e: any) {
        Alert.alert('Store error', String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      updateSub?.remove?.();
      errorSub?.remove?.();
    };
  }, []);

  const subscribe = async () => {
    const plan = PLANS[selected];
    const product = products[plan.id];
    const offerToken = offerTokenOf(bestOffer(product));
    if (!offerToken) {
      Alert.alert('Not available', 'This plan is not available right now. Please try again later.');
      return;
    }
    setBusy(true);
    try {
      await requestPurchase({
        type: 'subs',
        request: {
          google: {
            skus: [plan.id],
            subscriptionOffers: [{ sku: plan.id, offerToken }],
          },
        },
      });
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (!msg.toLowerCase().includes('cancel')) Alert.alert('Purchase error', msg);
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    try {
      const purchases: any[] = ((await getAvailablePurchases()) as any) ?? [];
      const mine = purchases.filter((p) => ALL_IDS.includes(p?.productId));
      if (mine.length === 0) {
        Alert.alert('Nothing to restore', 'No subscription was found on this Google account.');
        return;
      }
      let active = false;
      for (const p of mine) {
        if (await verifyOnServer(p)) {
          active = true;
          await finishTransaction({ purchase: p, isConsumable: false });
        }
      }
      Alert.alert(active ? 'Restored' : 'Not active', active ? 'Premium is active.' : 'That subscription is no longer active.');
    } catch (e: any) {
      Alert.alert('Restore failed', String(e?.message ?? e));
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.blue} />;

  const available = (Object.keys(PLANS) as PlanKey[]).filter((k) => products[PLANS[k].id]);
  const selProduct = products[PLANS[selected].id];
  const selTrial = trialDays(selProduct);
  const selPrice = `${selProduct?.displayPrice ?? PLANS[selected].fallbackPrice} / ${PLANS[selected].per}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={22} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Unlock More with OpportunityGenie Premium</Text>
        <Text style={styles.heroSub}>
          Make your scholarship search easier with personalized AI guidance and tools designed to support your academic journey.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>With Premium, you can:</Text>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={14} color={colors.blue} />
            </View>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.chooseTitle}>Choose Your Plan</Text>
      <Text style={styles.chooseSub}>Choose a plan that works for you and take the next step towards your academic goals.</Text>

      {available.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.benefitText}>
            Subscriptions are not available right now. Please make sure the app was installed from Google Play, then try again later.
          </Text>
        </View>
      ) : (
        available.map((k) => {
          const plan = PLANS[k];
          const product = products[plan.id];
          const on = selected === k;
          return (
            <Pressable key={k} onPress={() => setSelected(k)} style={[styles.plan, on && styles.planOn]}>
              <View style={styles.planTop}>
                <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {product?.displayPrice ?? plan.fallbackPrice}
                    <Text style={styles.planPer}> / {plan.per}</Text>
                  </Text>
                </View>
                {k === 'annual' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>BEST VALUE</Text>
                  </View>
                )}
              </View>
              {trialDays(product) ? (
                <View style={styles.trialPill}>
                  <Ionicons name="gift-outline" size={13} color={colors.teal} />
                  <Text style={styles.trialPillText}>{trialDays(product)}-day free trial</Text>
                </View>
              ) : null}
              <Text style={styles.planBlurb}>{plan.blurb}</Text>
            </Pressable>
          );
        })
      )}

      {available.length > 0 && (
        <>
          <Text style={styles.cta}>Start your Premium journey today!</Text>
          <Pressable style={({ pressed }) => [styles.subscribeBtn, (pressed || busy) && { opacity: 0.85 }]} onPress={subscribe} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeText}>{selTrial ? `Start ${selTrial}-day free trial` : 'Subscribe'}</Text>}
          </Pressable>
          {selTrial ? (
            <Text style={styles.trialNote}>
              Try everything free for {selTrial} days. You'll add a payment method in Google Play, and your first payment of {selPrice} is only taken after the trial ends. Cancel anytime before then and you won't be charged.
            </Text>
          ) : null}
        </>
      )}

      <Pressable onPress={restore} style={styles.restoreBtn}>
        <Text style={styles.restoreText}>Restore purchase</Text>
      </Pressable>
      <Text style={styles.legal}>
        Payment is charged to your Google Play account. Subscriptions renew automatically until you cancel them in Google Play, at least 24 hours before the renewal date. If your plan includes a free trial, the first payment is taken when the trial ends.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.blue, borderRadius: radius.xl, padding: 22, marginBottom: 16, ...shadow.card },
  heroIcon: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: { fontFamily: fonts.extraBold, fontSize: 22, color: '#fff', lineHeight: 29, marginBottom: 8 },
  heroSub: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 21 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line,
    padding: 18, marginBottom: 20, ...shadow.card,
  },
  sectionTitle: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.ink, marginBottom: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 11 },
  check: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.blueTint,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  benefitText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.ink, lineHeight: 21 },
  chooseTitle: { fontFamily: fonts.extraBold, fontSize: 19, color: colors.ink, marginBottom: 4 },
  chooseSub: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20, marginBottom: 14 },
  plan: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.line,
    padding: 16, marginBottom: 12,
  },
  planOn: { borderColor: colors.blue, backgroundColor: colors.blueTint },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  radioOn: { borderColor: colors.blue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.blue },
  planName: { fontFamily: fonts.extraBold, fontSize: 16, color: colors.ink },
  planPrice: { fontFamily: fonts.extraBold, fontSize: 20, color: colors.blue, marginTop: 2 },
  planPer: { fontFamily: fonts.medium, fontSize: 13, color: colors.inkSoft },
  planBlurb: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, lineHeight: 20 },
  badge: { backgroundColor: colors.blue, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bold, fontSize: 10.5, color: '#fff', letterSpacing: 0.5 },
  cta: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, textAlign: 'center', marginTop: 10, marginBottom: 12 },
  subscribeBtn: { backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center' },
  subscribeText: { fontFamily: fonts.bold, fontSize: 16, color: '#fff' },
  restoreBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
  restoreText: { fontFamily: fonts.bold, fontSize: 14, color: colors.blue },
  trialPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#E3F5F2', borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10, marginTop: 10 },
  trialPillText: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.teal },
  trialNote: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 18, marginTop: 10, marginBottom: 4 },
  legal: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.inkFaint, textAlign: 'center', lineHeight: 17 },
});
