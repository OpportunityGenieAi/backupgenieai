// Lightweight Google Analytics 4 for the app, sent over HTTPS (GA4 Measurement Protocol).
// Works through an OTA update because it needs no native code. No names, emails or other
// personal details are ever sent: only a random anonymous id, screen names and event names.
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const MEASUREMENT_ID = 'G-GLRQF0BDP9';
const API_SECRET = '6_45uJwARuiIZtwULEUZww';

const CID_KEY = 'og_ga_client_id';
const SESSION_GAP_MS = 30 * 60 * 1000;
const ENABLED = /^G-[A-Z0-9]+$/.test(MEASUREMENT_ID) && API_SECRET.length > 5;

type Params = Record<string, string | number | boolean | undefined>;
interface QueuedEvent { name: string; params: Params }

let clientId: string | null = null;
let sessionId = Math.floor(Date.now() / 1000);
let lastActivity = Date.now();
let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let lastScreen = '';

function randomId(): string {
  const r = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${r()}${r()}.${Math.floor(Date.now() / 1000)}`;
}

async function getClientId(): Promise<string> {
  if (clientId) return clientId;
  try {
    const saved = await SecureStore.getItemAsync(CID_KEY);
    if (saved) return (clientId = saved);
  } catch { /* fall through */ }
  clientId = randomId();
  try { await SecureStore.setItemAsync(CID_KEY, clientId); } catch { /* keep in memory */ }
  return clientId;
}

async function flush() {
  timer = null;
  if (!ENABLED || queue.length === 0) { queue = []; return; }
  const events = queue.splice(0, 25);
  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: await getClientId(),
          user_properties: {
            platform: { value: Platform.OS },
            app_version: { value: String(Constants.expoConfig?.version ?? '') },
          },
          events: events.map((e) => ({ name: e.name, params: e.params })),
        }),
      },
    );
  } catch { /* analytics must never affect the app */ }
  if (queue.length) timer = setTimeout(flush, 1500);
}

export const Analytics = {
  track(name: string, params: Params = {}) {
    if (!ENABLED) return;
    const now = Date.now();
    if (now - lastActivity > SESSION_GAP_MS) sessionId = Math.floor(now / 1000);
    lastActivity = now;
    queue.push({ name, params: { ...params, session_id: sessionId, engagement_time_msec: 100 } });
    if (!timer) timer = setTimeout(flush, 2000);
  },
  screen(name: string) {
    if (!name || name === lastScreen) return;
    lastScreen = name;
    Analytics.track('screen_view', { screen_name: name, screen_class: name });
  },
};
