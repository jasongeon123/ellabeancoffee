import Stripe from "stripe";

// Lazy initialization to prevent build errors when API key is not available
let stripeInstance: Stripe | null = null;

export function getStripeClient() {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    });
  }
  return stripeInstance;
}
