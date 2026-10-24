type Listener = () => void;
const listeners = new Set<Listener>();
let lastFired = 0;

export const PremiumGate = {
  notify() {
    const now = Date.now();
    if (now - lastFired < 3000) return; // avoid stacking popups
    lastFired = now;
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
