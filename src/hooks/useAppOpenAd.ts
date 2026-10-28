import { useEffect } from 'react';
import { AppState } from 'react-native';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

const MAX_AGE_MS = 4 * 60 * 60 * 1000; // App Open ads expire after 4 hours
const MIN_GAP_MS = 5 * 60 * 1000;      // never more often than this
const RETRY_MS = 60 * 1000;

/** Renders nothing. Shows an App Open ad when the user returns to the app from the background. */
export default function AppOpenManager() {
  const { adsEnabled, sdkReady, appOpenUnitId } = usePublicSettings();

  useEffect(() => {
    if (!adsEnabled || !sdkReady) return;

    let ad: AppOpenAd | null = null;
    let loaded = false;
    let loadedAt = 0;
    let showing = false;
    let lastShownAt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const load = () => {
      if (cancelled) return;
      const current = AppOpenAd.createForAdRequest(appOpenUnitId, { requestNonPersonalizedAdsOnly: false });
      ad = current;
      loaded = false;
      current.addAdEventListener(AdEventType.LOADED, () => {
        if (ad === current) { loaded = true; loadedAt = Date.now(); }
      });
      current.addAdEventListener(AdEventType.CLOSED, () => {
        if (ad !== current) return;
        showing = false; loaded = false; load();
      });
      current.addAdEventListener(AdEventType.ERROR, () => {
        if (ad !== current) return;
        showing = false; loaded = false;
        retry = setTimeout(load, RETRY_MS);
      });
      current.load();
    };

    load();

    let prev = AppState.currentState;
    const sub = AppState.addEventListener('change', (next) => {
      const returning = prev !== 'active' && next === 'active';
      prev = next;
      if (!returning || showing || !ad || !loaded) return;
      if (Date.now() - loadedAt > MAX_AGE_MS) { load(); return; }
      if (Date.now() - lastShownAt < MIN_GAP_MS) return;
      showing = true;
      lastShownAt = Date.now();
      ad.show();
    });

    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      sub.remove();
    };
  }, [adsEnabled, sdkReady, appOpenUnitId]);

  return null;
}