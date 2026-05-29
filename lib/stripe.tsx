import React, { type ReactNode } from "react";

export function StripeProvider({
  children,
  ..._props
}: {
  children: ReactNode;
  [key: string]: any;
}) {
  return <>{children}</>;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({
      error: { code: "web_not_supported", message: "Use PaymentElement on web" },
    }),
  };
}
