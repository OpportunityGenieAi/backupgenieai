import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

// Standard 320x50 banner: a fixed height, so the layout never jumps when an ad arrives or refreshes.
const BANNER_HEIGHT = 50;
// If AdMob has no ad to give right now (common for new ad units), ask again after this long.
const RETRY_MS = 60 * 1000;

/**
 * The ad refreshes in place (the rate is set in AdMob). A failed load is retried after a minute,
 * so one "no ad available" answer does not hide the banner for the rest of the session.
 * The offsetMs prop is kept so existing screens still compile, but it is unused.
 */
export function AdBanner(_props: { offsetMs?: number }) {
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

  if (!adsEnabled || !sdkReady || failed) return null;

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
