import { supabase, toCamelCase } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
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
  isPro: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
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
        setProfile(toCamelCase<Profile>(data));
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("[AuthContext] fetchProfile error:", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[AuthContext] getSession error from Supabase:", error);
        }
        if (!active) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("[AuthContext] initAuth caught error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[AuthContext] onAuthStateChange:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      if (!active) return;
      
      // Prevent child components from mounting and making concurrent 
      // Supabase requests while we are fetching the profile
      setLoading(true);
      
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
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
