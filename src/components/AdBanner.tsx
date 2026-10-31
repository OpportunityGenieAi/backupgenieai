import React, { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

// Standard 320x50 banner: a fixed height, so the layout never jumps when an ad arrives or refreshes.
const BANNER_HEIGHT = 50;

/**
 * The ad refreshes in place (the rate is set in AdMob, see below). There are no timers and no remounting,
 * so nothing on screen moves. The offsetMs prop is kept so existing screens still compile, but it is unused.
 */
export function AdBanner(_props: { offsetMs?: number }) {
  const { adsEnabled, sdkReady, bannerUnitId } = usePublicSettings();
  const [failed, setFailed] = useState(false);

  if (!adsEnabled || !sdkReady || failed) return null;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: BANNER_HEIGHT, marginVertical: 10 }}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}