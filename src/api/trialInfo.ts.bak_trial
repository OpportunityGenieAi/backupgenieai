import { initConnection, fetchProducts } from 'expo-iap';

// Helpers for the free-trial offer. Google only lists a trial offer for people who are still
// eligible, so if one is present in the product it is safe to show trial wording.

function phasesOf(offer: any): any[] {
  const p = offer?.pricingPhases ?? offer?.pricingPhasesAndroid ?? offer?.pricingPhaseList;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.pricingPhaseList)) return p.pricingPhaseList;
  return [];
}

function isFreePhase(ph: any): boolean {
  const micros = Number(ph?.priceAmountMicros ?? ph?.priceAmountMicrosAndroid);
  if (!Number.isNaN(micros) && ph?.priceAmountMicros !== undefined) return micros === 0;
  return /free/i.test(String(ph?.formattedPrice ?? ''));
}

export function offersOf(product: any): any[] {
  return product?.subscriptionOffers ?? product?.subscriptionOfferDetailsAndroid ?? [];
}

export function offerTokenOf(offer: any): string | undefined {
  return offer?.offerTokenAndroid ?? offer?.offerToken;
}

/** The offer that starts with a free phase, if the user can get one. */
export function trialOffer(product: any): any | null {
  return offersOf(product).find((o) => {
    const ph = phasesOf(o);
    return ph.length > 0 && isFreePhase(ph[0]) && !!offerTokenOf(o);
  }) ?? null;
}

/** Number of free days (e.g. 3), or null when there is no trial. */
export function trialDays(product: any): number | null {
  const offer = trialOffer(product);
  if (!offer) return null;
  const period = String(phasesOf(offer)[0]?.billingPeriod ?? '');
  const d = /^P(\d+)D$/.exec(period);
  if (d) return Number(d[1]);
  const w = /^P(\d+)W$/.exec(period);
  if (w) return Number(w[1]) * 7;
  return 3;
}

/** Trial first, otherwise the plain base-plan offer. */
export function bestOffer(product: any): any | null {
  const offers = offersOf(product).filter((o) => !!offerTokenOf(o));
  return trialOffer(product) ?? offers.find((o) => phasesOf(o).length <= 1) ?? offers[0] ?? null;
}

let cache: { at: number; value: boolean } | null = null;

/** Quick check used by the pop-up. Never throws, never waits longer than ~2.5 s. */
export async function trialAvailable(): Promise<boolean> {
  if (cache && Date.now() - cache.at < 10 * 60 * 1000) return cache.value;
  const work = (async () => {
    await initConnection();
    const res: any[] = ((await fetchProducts({ skus: ['premium_monthly', 'premium_annual'], type: 'subs' })) as any) ?? [];
    return res.some((p) => !!trialOffer(p));
  })();
  const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2500));
  try {
    const value = await Promise.race([work, timeout]);
    cache = { at: Date.now(), value };
    return value;
  } catch {
    return false;
  }
}
