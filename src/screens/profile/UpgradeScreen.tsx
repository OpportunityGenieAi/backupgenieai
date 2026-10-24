import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import {
  initConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'expo-iap';

const SUBSCRIPTION_ID = 'premium_monthly';

// TODO: send the token to your backend; return true only if the server verified it
async function verifyOnServer(purchase: any): Promise<boolean> {
  // e.g. POST /subscription/verify { productId, purchaseToken }
  // The server checks it with the Google Play Developer API and sets subscription_tier.
  return false;
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
              Alert.alert('Verification failed', 'Please contact support.');
            }
          } catch (e: any) {
            Alert.alert('Error', String(e?.message ?? e));
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
    </View>
  );
}
