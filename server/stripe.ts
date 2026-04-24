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
  starter: {
    name: "LensParty Starter",
    price: 1999, // cents = $19.99
    priceDisplay: "$19.99",
    features: [
      "1 event",
      "Up to 200 photos & videos",
      "100 guests",
      "60-day upload window",
      "12-month storage",
      "5 gallery themes",
      "No watermark",
      "QR code & print templates",
    ],
  },
  pro: {
    name: "LensParty Pro",
    price: 4999, // cents = $49.99
    priceDisplay: "$49.99",
    features: [
      "Unlimited photos & videos",
      "Unlimited guests",
      "AI face search",
      "Audio & video guestbook",
      "Live slideshow",
      "20+ gallery themes",
      "12-month upload window",
      "24-month storage",
      "Priority email support",
    ],
  },
  business: {
    name: "LensParty Business",
    price: 7999, // cents = $79.99
    priceDisplay: "$79.99",
    features: [
      "Everything in Pro",
      "5 concurrent events",
      "White-label branding",
      "RSVP management",
      "Analytics dashboard",
      "Print ordering",
      "AI video highlights",
      "Dedicated support",
    ],
  },
} as const;
