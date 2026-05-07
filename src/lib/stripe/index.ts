import "server-only";
import Stripe from "stripe";

const config: Stripe.StripeConfig = { typescript: true };

if (process.env.STRIPE_MOCK_URL) {
  const url = new URL(process.env.STRIPE_MOCK_URL);
  config.host = url.hostname;
  config.port = parseInt(url.port, 10) || (url.protocol === "https:" ? 443 : 80);
  config.protocol = url.protocol.replace(":", "") as "http" | "https";
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", config);
