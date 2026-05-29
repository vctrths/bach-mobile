// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";
import Stripe from "https://esm.sh/stripe@14?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-11-20",
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function markPremiumFromCheckout(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) {
    throw new Error("Missing checkout session client_reference_id.");
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
      premium_activated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

async function markSubscriptionInactive(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: false,
      stripe_subscription_id: null,
      premium_activated_at: null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) throw error;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return json({ error: "Missing Stripe signature" }, 400);
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") ?? "",
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe webhook signature",
      },
      400,
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await markPremiumFromCheckout(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted":
        await markSubscriptionInactive(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return json({ error: "Webhook handler failed" }, 500);
  }
});
