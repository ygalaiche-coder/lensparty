import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const isStripeConfigured = !!STRIPE_SECRET_KEY;

let stripe: Stripe | null = null;
if (isStripeConfigured) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
  console.log("[Stripe] Payment processing configured");
} else {
  console.log("[Stripe] Not configured — payments disabled");
}

export function isPaymentsEnabled(): boolean {
  return !!stripe;
}

export function getStripe(): Stripe | null {
  return stripe;
}

export const PLANS = {
  pro: {
    name: "LensParty Pro",
    price: 1999, // cents
    priceDisplay: "$19.99",
    features: ["Unlimited photos", "Unlimited guests", "AI face search", "24-month storage", "12-month upload window"],
  },
  business: {
    name: "LensParty Business",
    price: 3999, // cents
    priceDisplay: "$39.99",
    features: ["5 events included", "White-label branding", "RSVP management", "Analytics dashboard", "Priority support"],
  },
} as const;
