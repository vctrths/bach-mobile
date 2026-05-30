import { supabase, toCamelCase } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  profileImage: string | null;
  description: string | null;
  expoPushToken?: string | null;
  isPremium: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  premiumActivatedAt?: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const hardReloadWeb = useCallback((reason: string) => {
    console.warn(`[AuthContext] ${reason}`);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.reload();
      return true;
    }

    return false;
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      console.log("[AuthContext] fetchProfile:", {
        userId,
        hasData: !!data,
        error: error?.message,
        fullData: JSON.stringify(data),
      });

      if (data) {
        const nextProfile = toCamelCase<Profile>(data);
        const normalizedProfile = {
          ...nextProfile,
          isPremium: Boolean(nextProfile.isPremium),
        };
        setProfile({
          ...normalizedProfile,
        });
        return normalizedProfile;
      } else {
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error("[AuthContext] fetchProfile error:", error);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let initialSessionTimeout: ReturnType<typeof setTimeout> | null = null;
    let authStateTimeout: ReturnType<typeof setTimeout> | null = null;

    const clearInitialSessionTimeout = () => {
      if (initialSessionTimeout) {
        clearTimeout(initialSessionTimeout);
        initialSessionTimeout = null;
      }
    };

    const clearAuthStateTimeout = () => {
      if (authStateTimeout) {
        clearTimeout(authStateTimeout);
        authStateTimeout = null;
      }
    };

    const startAuthStateTimeout = (event: string) => {
      clearAuthStateTimeout();
      authStateTimeout = setTimeout(() => {
        hardReloadWeb(
          `Auth state change "${event}" timed out after 2500ms; forcing hard reload.`
        );
      }, 2500);
    };

    const initializeSession = async () => {
      initialSessionTimeout = setTimeout(() => {
        hardReloadWeb(
          "Initial session fetch timed out after 2500ms; forcing hard reload."
        );
      }, 2500);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        clearInitialSessionTimeout();

        if (!active) return;

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        clearInitialSessionTimeout();
        console.error("[AuthContext] initial getSession error:", error);

        if (hardReloadWeb("Initial session fetch failed; forcing hard reload.")) {
          return;
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[AuthContext] onAuthStateChange:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      
      if (!active) return;
      
      // Initial auth loading is handled by initializeSession above.
      // Do not block the UI for INITIAL_SESSION or SIGNED_IN here: Supabase can
      // re-emit those when a PWA resumes, which can trap the app on the spinner.
      // This prevents the entire app from unmounting and remounting (which refetches all data)
      // whenever the user tabs back into the browser and triggers auth restoration events.
      const shouldBlockUI = _event === 'SIGNED_OUT';
      
      if (shouldBlockUI) {
        startAuthStateTimeout(_event);
        setLoading(true);
      }
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[AuthContext] onAuthStateChange callback error:", error);

        if (shouldBlockUI) {
          hardReloadWeb(`Auth state change "${_event}" failed; forcing hard reload.`);
        }
      } finally {
        if (shouldBlockUI) {
          clearAuthStateTimeout();
        }

        if (active) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      clearInitialSessionTimeout();
      clearAuthStateTimeout();
      subscription.unsubscribe();
    };
  }, [fetchProfile, hardReloadWeb]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  }, [fetchProfile, user]);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
