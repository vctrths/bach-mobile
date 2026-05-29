-- Premium subscription fields for Stripe Payment Link webhook
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS premium_activated_at timestamp with time zone;

-- Do not let browser clients self-upgrade premium state.
REVOKE UPDATE (
  is_premium,
  stripe_customer_id,
  stripe_subscription_id,
  premium_activated_at
) ON public.profiles FROM anon, authenticated;
