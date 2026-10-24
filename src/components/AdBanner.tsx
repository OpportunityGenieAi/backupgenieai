import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

// Every banner asks for a fresh ad this often.
const REFRESH_MS = 5 * 60 * 1000;
// If an ad fails to load, try again after this long (the banner takes no space meanwhile).
const RETRY_MS = 60 * 1000;

/**
 * offsetMs staggers the reload so several banners on one screen do not all refresh at the same instant.
 */
export function AdBanner({ offsetMs = 0 }: { offsetMs?: number }) {
  const { adsEnabled, bannerUnitId } = usePublicSettings();
  const [reloadKey, setReloadKey] = useState(0);
  const [failed, setFailed] = useState(false);

  // Fresh ad on a timer.
  useEffect(() => {
    if (!adsEnabled) return;
    const id = setInterval(() => {
      setFailed(false);
      setReloadKey((k) => k + 1);
    }, REFRESH_MS + offsetMs);
    return () => clearInterval(id);
  }, [adsEnabled, offsetMs]);

  // After a failed load, collapse and retry later.
  useEffect(() => {
    if (!failed) return;
    const id = setTimeout(() => {
      setFailed(false);
      setReloadKey((k) => k + 1);
    }, RETRY_MS);
    return () => clearTimeout(id);
  }, [failed]);

  if (!adsEnabled || failed) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        key={reloadKey}
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
