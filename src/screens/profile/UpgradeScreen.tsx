import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
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

const SUBSCRIPTION_ID = 'premium_monthly';

function tokenOf(purchase: any): string | undefined {
  return purchase?.purchaseToken ?? purchase?.purchaseTokenAndroid;
}

async function verifyOnServer(purchase: any): Promise<boolean> {
  const token = tokenOf(purchase);
  if (!token) throw new Error('No purchase token found on this purchase.');
  const status = await SubscriptionApi.verify(token, purchase?.productId);
  return !!status.premium;
}

export default function UpgradeScreen() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
          Alert.alert('Purchase error', `${err?.code ?? ''} ${err?.message ?? ''}`);
        });

        const result: any = await fetchProducts({ skus: [SUBSCRIPTION_ID], type: 'subs' });
        setProduct(result?.[0] ?? null);
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
    const offers = product?.subscriptionOffers ?? [];
    const offerToken = offers[0]?.offerTokenAndroid ?? offers[0]?.offerToken;
    if (!offerToken) {
      Alert.alert('Not available', 'No offer token found for this subscription.');
      return;
    }
    await requestPurchase({
      type: 'subs',
      request: {
        google: {
          skus: [SUBSCRIPTION_ID],
          subscriptionOffers: [{ sku: SUBSCRIPTION_ID, offerToken }],
        },
      },
    });
  };

  const restore = async () => {
    try {
      const purchases: any[] = ((await getAvailablePurchases()) as any) ?? [];
      const mine = purchases.filter((p) => p?.productId === SUBSCRIPTION_ID);
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!product) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Subscription not found in Google Play. Check the product ID and that the app was installed from the Play Store.</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>{product.title ?? 'Premium'}</Text>
      <Text style={{ marginBottom: 16 }}>{product.displayPrice ?? ''}</Text>
      <Button title="Subscribe" onPress={subscribe} />
      <View style={{ height: 12 }} />
      <Button title="Restore purchase" onPress={restore} />
    </View>
  );
}
