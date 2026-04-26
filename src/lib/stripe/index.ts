import "server-only";
import Stripe from "stripe";

function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");

  const config: Stripe.StripeConfig = { typescript: true };

  if (process.env.STRIPE_MOCK_URL) {
    const url = new URL(process.env.STRIPE_MOCK_URL);
    config.host = url.hostname;
    config.port = parseInt(url.port, 10) || (url.protocol === "https:" ? 443 : 80);
    config.protocol = url.protocol.replace(":", "") as "http" | "https";
  }

  return new Stripe(key, config);
}

// Lazy singleton — instantiated only when first property is accessed,
// so missing STRIPE_SECRET_KEY won't throw at module evaluation time.
let _stripe: Stripe | undefined;

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    if (!_stripe) _stripe = createStripeClient();
    return Reflect.get(_stripe, prop, receiver);
  },
});
