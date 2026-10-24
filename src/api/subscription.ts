import { API_BASE_URL } from '../config/env';
import { TokenStorage } from './tokenStorage';

export interface SubscriptionStatus {
  premium: boolean;
  access: boolean;
  expires_at?: string | null;
  auto_renewing?: boolean;
}

export const SubscriptionApi = {
  async verify(purchaseToken: string, productId?: string): Promise<SubscriptionStatus> {
    const token = await TokenStorage.read();
    if (!token) throw new Error('Please log in first, then try again.');
    const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/subscription/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ purchase_token: purchaseToken, product_id: productId }),
    });
    const text = await res.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    if (!res.ok) {
      const detail = typeof body?.detail === 'string' ? body.detail : `Server error (${res.status}).`;
      throw new Error(detail);
    }
    return body as SubscriptionStatus;
  },
};
