import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { usePublicSettings } from '../context/PublicSettingsContext';

// At most one full-screen ad this often, across the whole app. Change this number to show them more or less often.
const MIN_GAP_MS = 4 * 60 * 1000;
// Wait this long before asking for another ad after one fails to load.
const RETRY_MS = 60 * 1000;

// One shared ad for the whole app (it used to be one per scholarship card).
let ad: InterstitialAd | null = null;
let adUnit = '';
let loaded = false;
let lastShownAt = 0;
let shownFirstOpen = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function ensureAd(unitId: string) {
  if (ad && adUnit === unitId) return;
  const current = InterstitialAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false });
  ad = current;
  adUnit = unitId;
  loaded = false;
  current.addAdEventListener(AdEventType.LOADED, () => {
    if (ad === current) { loaded = true; notify(); }
  });
  current.addAdEventListener(AdEventType.CLOSED, () => {
    if (ad === current) { loaded = false; notify(); current.load(); }
  });
  current.addAdEventListener(AdEventType.ERROR, () => {
    if (ad === current) {
      loaded = false;
      notify();
      setTimeout(() => { if (ad === current) current.load(); }, RETRY_MS);
    }
  });
  current.load();
}

export function useInterstitialAd() {
  const { adsEnabled, sdkReady, interstitialUnitId } = usePublicSettings();
  const [, force] = useState(0);

  useEffect(() => {
    if (!adsEnabled || !sdkReady) return;
    ensureAd(interstitialUnitId);
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [adsEnabled, sdkReady, interstitialUnitId]);

  /** Shows the shared ad if one is ready and the cooldown has passed. */
  const tryShow = useCallback((minGapMs: number = MIN_GAP_MS) => {
    if (!adsEnabled || !ad || !loaded) return false;
    if (Date.now() - lastShownAt < minGapMs) return false;
    lastShownAt = Date.now();
    loaded = false;
    notify();
    ad.show();
    return true;
  }, [adsEnabled]);

  /** First time a scholarship is opened this session. Respects the same cooldown. */
  const showIfFirstTimeThisSession = useCallback(() => {
    if (shownFirstOpen) return false;
    const shown = tryShow();
    if (shown) shownFirstOpen = true;
    return shown;
  }, [tryShow]);

  return { showIfFirstTimeThisSession, tryShow, loaded };
}

/** Call this in a tab screen: shows a full-screen ad when the tab opens, at most once per cooldown. */
export function useShowAdOnFocus() {
  const { tryShow } = useInterstitialAd();
  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => { tryShow(); }, 400);
      return () => clearTimeout(id);
    }, [tryShow])
  );
}