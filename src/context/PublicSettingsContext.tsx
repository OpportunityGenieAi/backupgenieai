import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';
import { SettingsApi } from '../api/settings';

const TEST_BANNER_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/2934735716',
  android: 'ca-app-pub-3940256099942544/6300978111',
  default: 'ca-app-pub-3940256099942544/6300978111',
})!;

const TEST_INTERSTITIAL_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/4411468910',
  android: 'ca-app-pub-3940256099942544/1033173712',
  default: 'ca-app-pub-3940256099942544/1033173712',
})!;

const TEST_APP_OPEN_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/5575463023',
  default: 'ca-app-pub-3940256099942544/9257395921',
})!;

const TEST_NATIVE_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-3940256099942544/3986624511',
  default: 'ca-app-pub-3940256099942544/2247696110',
})!;

interface PublicSettingsValue {
  adsEnabled: boolean;
  sdkReady: boolean;
  bannerUnitId: string;
  interstitialUnitId: string;
  appOpenUnitId: string;
  nativeUnitId: string;
  usingTestAds: boolean;
}

const DEFAULTS: PublicSettingsValue = {
  adsEnabled: false,
  sdkReady: false,
  bannerUnitId: TEST_BANNER_UNIT_ID,
  interstitialUnitId: TEST_INTERSTITIAL_UNIT_ID,
  appOpenUnitId: TEST_APP_OPEN_UNIT_ID,
  nativeUnitId: TEST_NATIVE_UNIT_ID,
  usingTestAds: true,
};

const PublicSettingsContext = createContext<PublicSettingsValue>(DEFAULTS);

export function PublicSettingsProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<PublicSettingsValue>(DEFAULTS);

  // Start the Google Mobile Ads SDK once. Ads are only requested after this finishes.
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => setValue((v) => ({ ...v, sdkReady: true })))
      .catch((e) => {
        console.warn('Mobile Ads init failed', e);
        setValue((v) => ({ ...v, sdkReady: true })); // do not block ads forever
      });
  }, []);

  const load = useCallback(async () => {
    try {
      const rows = await SettingsApi.getPublic();
      const map: Record<string, string> = {};
      rows.forEach((r) => { if (r.value) map[r.key] = r.value; });

      const ios = Platform.OS === 'ios';
      const bannerUnitId = map[ios ? 'admob_banner_unit_id_ios' : 'admob_banner_unit_id_android'] || TEST_BANNER_UNIT_ID;
      const interstitialUnitId = map[ios ? 'admob_interstitial_unit_id_ios' : 'admob_interstitial_unit_id_android'] || TEST_INTERSTITIAL_UNIT_ID;
      const appOpenUnitId = map[ios ? 'admob_app_open_unit_id_ios' : 'admob_app_open_unit_id_android'] || TEST_APP_OPEN_UNIT_ID;
      const nativeUnitId = map[ios ? 'admob_native_unit_id_ios' : 'admob_native_unit_id_android'] || TEST_NATIVE_UNIT_ID;

      setValue((v) => ({
        ...v,
        adsEnabled: map['ads_enabled'] === 'true',
        bannerUnitId,
        interstitialUnitId,
        appOpenUnitId,
        nativeUnitId,
        usingTestAds:
          bannerUnitId === TEST_BANNER_UNIT_ID ||
          interstitialUnitId === TEST_INTERSTITIAL_UNIT_ID,
      }));
    } catch {
      // keep ads-disabled defaults on failure
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <PublicSettingsContext.Provider value={value}>{children}</PublicSettingsContext.Provider>;
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}