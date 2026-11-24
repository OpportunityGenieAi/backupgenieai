import React, { Component, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { colors, fonts, radius, shadow } from '../theme/colors';
import { usePublicSettings } from '../context/PublicSettingsContext';

// If Google has no ad right now (common for new ad units), try again a few times, spaced out.
const RETRY_MS = 90 * 1000;
const MAX_RETRIES = 3;

/** A native ad that looks like a scholarship card. It renders nothing until an ad has loaded, so there is never an empty gap. */
function NativeAdInner() {
  const { adsEnabled, sdkReady, nativeUnitId } = usePublicSettings();
  const [ad, setAd] = useState<NativeAd | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!adsEnabled || !sdkReady) return;
    let cancelled = false;
    let created: NativeAd | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    NativeAd.createForAdRequest(nativeUnitId, { requestNonPersonalizedAdsOnly: false })
      .then((loaded) => {
        if (cancelled) { loaded.destroy(); return; }
        created = loaded;
        setAd(loaded);
      })
      .catch(() => {
        if (!cancelled && tries < MAX_RETRIES) timer = setTimeout(() => setTries((t) => t + 1), RETRY_MS);
      });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (created) created.destroy();
    };
  }, [adsEnabled, sdkReady, nativeUnitId, tries]);

  if (!adsEnabled || !sdkReady || !ad) return null;

  return (
    <View style={styles.wrap}>
      <NativeAdView nativeAd={ad} style={styles.card}>
        <View style={styles.topRow}>
          {ad.icon ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: ad.icon.url }} style={styles.icon} />
            </NativeAsset>
          ) : null}
          <View style={{ flex: 1 }}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={2}>{ad.headline}</Text>
            </NativeAsset>
            {ad.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser} numberOfLines={1}>{ad.advertiser}</Text>
              </NativeAsset>
            ) : null}
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>Ad</Text></View>
        </View>

        <NativeMediaView style={styles.media} />

        {ad.body ? (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.body} numberOfLines={3}>{ad.body}</Text>
          </NativeAsset>
        ) : null}

        {ad.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.cta}>{ad.callToAction}</Text>
          </NativeAsset>
        ) : null}
      </NativeAdView>
    </View>
  );
}

/** If anything in the ad ever fails to draw, hide it instead of crashing the screen. */
class Guard extends Component<{ children: React.ReactNode }, { bad: boolean }> {
  state = { bad: false };
  static getDerivedStateFromError() { return { bad: true }; }
  componentDidCatch() {}
  render() { return this.state.bad ? null : this.props.children; }
}

export function NativeAdCard() {
  return (
    <Guard>
      <NativeAdInner />
    </Guard>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line,
    ...shadow.card,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 10 },
  headline: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  advertiser: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft, marginTop: 1 },
  badge: { backgroundColor: colors.accentTint, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.accent },
  media: { width: '100%', height: 170, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.pill },
  body: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.inkSoft, marginTop: 10, lineHeight: 19 },
  cta: {
    marginTop: 12, textAlign: 'center', fontFamily: fonts.bold, fontSize: 14.5, color: '#fff',
    backgroundColor: colors.blue, borderRadius: radius.md, paddingVertical: 11, overflow: 'hidden',
  },
});
