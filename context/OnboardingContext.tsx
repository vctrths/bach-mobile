import React, { createContext, useState, ReactNode } from "react";

export interface OnboardingData {
  role: "tuineigenaar" | "tuinzoeker" | null;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  password: string;
  profileImage?: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  reset: () => void;
}

const defaultData: OnboardingData = {
  role: null,
  firstName: "",
  lastName: "",
  email: "",
  description: "",
  password: "",
  profileImage: undefined,
};

export const OnboardingContext = createContext<OnboardingContextType>({
  data: defaultData,
  updateData: () => {},
  reset: () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const reset = () => {
    setData(defaultData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}
