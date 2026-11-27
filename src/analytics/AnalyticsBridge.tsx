import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Analytics } from './analytics';

function activeRouteName(state: any): string {
  let s = state;
  while (s?.routes?.[s.index ?? 0]?.state) s = s.routes[s.index ?? 0].state;
  return s?.routes?.[s.index ?? 0]?.name ?? '';
}

// Rendered once inside the navigator: records app opens and which screens people visit.
export default function AnalyticsBridge() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    Analytics.track('app_open');
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') Analytics.track('app_open'); });
    const unsub = navigation.addListener('state', () => Analytics.screen(activeRouteName(navigation.getState())));
    Analytics.screen(activeRouteName(navigation.getState()));
    return () => { sub.remove(); unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
