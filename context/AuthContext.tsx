import { supabase, toCamelCase } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";

const AUTH_SESSION_TIMEOUT_MS = 7000;

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
    let profileRequestId = 0;

    const withTimeout = async <T,>(
      promise: Promise<T>,
      label: string,
    ): Promise<T | null> => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const timeout = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          console.warn(
            `[AuthContext] ${label} timed out after ${AUTH_SESSION_TIMEOUT_MS}ms; continuing without blocking the UI.`,
          );
          resolve(null);
        }, AUTH_SESSION_TIMEOUT_MS);
      });

      try {
        return await Promise.race([promise, timeout]);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    const scheduleProfileFetch = (userId: string, source: string) => {
      const requestId = ++profileRequestId;

      setTimeout(() => {
        fetchProfile(userId).catch((error) => {
          if (active && requestId === profileRequestId) {
            console.error(`[AuthContext] ${source} profile fetch error:`, error);
            setProfile(null);
          }
        });
      }, 0);
    };

    const initializeSession = async () => {
      try {
        const result = await withTimeout(
          supabase.auth.getSession(),
          "Initial session fetch",
        );

        if (!active) return;

        const session = result?.data.session ?? null;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[AuthContext] initial getSession error:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[AuthContext] onAuthStateChange:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      
      if (!active) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        scheduleProfileFetch(session.user.id, `Auth state change "${_event}"`);
      } else {
        profileRequestId += 1;
        setProfile(null);
      }

      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
