import React, { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

// In-feed banners are a standard 320x50: a fixed height, so the list never jumps when an ad arrives.
const BANNER_HEIGHT = 50;
// If AdMob has no ad to give right now, ask again after this long (and again whenever the app comes back to the front).
const RETRY_MS = 15 * 1000;

/**
 * sticky = the banner pinned to the bottom of the home screen: full width, always on screen.
 * A failed load is retried every few seconds, so one "no ad available" answer never hides the banner for long.
 * It takes no space at all until an ad has loaded. The offsetMs prop is kept so existing screens still compile.
 */
export function AdBanner({ sticky = false }: { offsetMs?: number; sticky?: boolean }) {
  const { adsEnabled, sdkReady, bannerUnitId } = usePublicSettings();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!failed) return;
    const id = setTimeout(() => {
      setFailed(false);
      setAttempt((n) => n + 1);
    }, RETRY_MS);
    return () => clearTimeout(id);
  }, [failed]);

  // Coming back to the app is a fresh chance for an ad.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        setFailed(false);
        setAttempt((n) => n + 1);
      }
    });
    return () => sub.remove();
  }, []);

  if (!adsEnabled || !sdkReady || failed) return null;

  if (sticky) {
    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <BannerAd
          key={attempt}
          unitId={bannerUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
          onAdFailedToLoad={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: BANNER_HEIGHT, marginVertical: 10 }}>
      <BannerAd
        key={attempt}
        unitId={bannerUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
