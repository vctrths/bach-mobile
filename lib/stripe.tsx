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
    initPaymentSheet: async (_params: any): Promise<{ error?: { message: string } }> => {
      return {};
    },
    presentPaymentSheet: async (): Promise<{ error?: { code: string; message: string } }> => {
      return {};
    },
  };
}
