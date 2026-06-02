import { supabase, toCamelCase } from "@/utils/supabase";
import { UserRole } from "@/utils/role";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";

const ACTIVE_GARDENER_CHECK_TIMEOUT_MS = 2500;

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
  hasActiveGardenerConnection: boolean;
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
  hasActiveGardenerConnection: false,
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
  const [hasActiveGardenerConnection, setHasActiveGardenerConnection] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchActiveGardenerConnection = useCallback(
    async (userId: string, role: string | null | undefined) => {
      const normalizedRole = role?.toLowerCase();

      if (normalizedRole === UserRole.TUIN_EIGENAAR) return false;
      if (normalizedRole === UserRole.TUIN_ZOEKER_MET_TUIN) return true;
      if (normalizedRole !== UserRole.TUIN_ZOEKER) return false;

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const timeout = new Promise<boolean>((resolve) => {
        timeoutId = setTimeout(() => {
          console.warn(
            "[AuthContext] active gardener connection check timed out",
            { userId },
          );
          resolve(false);
        }, ACTIVE_GARDENER_CHECK_TIMEOUT_MS);
      });

      const query = supabase
        .from("collaborations")
        .select("id")
        .eq("gardener_id", userId)
        .eq("status", "active")
        .limit(1)
        .then(({ data, error }) => {
          if (error) {
            console.error(
              "[AuthContext] active gardener connection check error:",
              error,
            );
            return false;
          }

          return (data?.length ?? 0) > 0;
        });

      const hasConnection = await Promise.race([query, timeout]);
      if (timeoutId) clearTimeout(timeoutId);

      return hasConnection;
    },
    [],
  );

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        const nextProfile = toCamelCase<Profile>(data);
        const nextHasActiveGardenerConnection =
          await fetchActiveGardenerConnection(userId, nextProfile.role);
        const normalizedProfile = {
          ...nextProfile,
          isPremium: Boolean(nextProfile.isPremium),
        };
        setHasActiveGardenerConnection(nextHasActiveGardenerConnection);
        setProfile({
          ...normalizedProfile,
        });
        return normalizedProfile;
      } else {
        setProfile(null);
        setHasActiveGardenerConnection(false);
        return null;
      }
    } catch (error) {
      console.error("[AuthContext] fetchProfile error:", error);
      setProfile(null);
      setHasActiveGardenerConnection(false);
      return null;
    }
  }, [fetchActiveGardenerConnection]);

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
          setHasActiveGardenerConnection(false);
        }
      } catch (error) {
        console.error("[AuthContext] initial getSession error:", error);
        if (active) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setHasActiveGardenerConnection(false);
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setAuthError(null);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session?.user) {
        setProfile(null);
        setHasActiveGardenerConnection(false);
        return;
      }

      // Supabase can deadlock if another Supabase call is awaited inside this
      // callback. Defer profile fetching until after the auth lock is released.
      setTimeout(() => {
        if (!active) return;
        fetchProfile(session.user.id).catch((error) => {
          console.error("[AuthContext] deferred fetchProfile error:", error);
        });
      }, 0);
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
    setHasActiveGardenerConnection(false);
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
        setHasActiveGardenerConnection(false);
      }
    } catch (error) {
      console.error("[AuthContext] retryAuth error:", error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setHasActiveGardenerConnection(false);
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
      setHasActiveGardenerConnection(false);
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
        hasActiveGardenerConnection,
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
