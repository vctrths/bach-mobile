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
  authError: string | null;
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
  resetAuthSession: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signOut: async () => {},
  retryAuth: async () => {},
  resetAuthSession: async () => {},
  refreshProfile: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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

    const initializeSession = async () => {
      try {
        setAuthError(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!active) return;

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[AuthContext] initial getSession error:", error);
        if (active) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthError(
            "We konden je sessie niet herstellen. Probeer opnieuw of log opnieuw in.",
          );
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
      
      try {
        setAuthError(null);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("[AuthContext] onAuthStateChange callback error:", error);
        if (active) {
          setAuthError(
            "Er ging iets mis bij het verwerken van je sessie. Probeer opnieuw of log opnieuw in.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
    setAuthError(null);
  };

  const retryAuth = useCallback(async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("[AuthContext] retryAuth error:", error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setAuthError(
        "We konden je sessie nog niet herstellen. Controleer je verbinding of log opnieuw in.",
      );
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const resetAuthSession = useCallback(async () => {
    setLoading(true);
    setAuthError(null);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[AuthContext] resetAuthSession signOut error:", error);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  }, [fetchProfile, user]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        authError,
        signOut,
        retryAuth,
        resetAuthSession,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
