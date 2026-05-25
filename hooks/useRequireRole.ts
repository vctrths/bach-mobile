import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/utils/role";
import { router } from "expo-router";
import { useEffect } from "react";

export function useRequireRole(allowedRoles: UserRole[]) {
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace("/login");
      return;
    }

    if (!profile.role || !allowedRoles.includes(profile.role)) {
      router.replace("/dashboard");
    }
  }, [profile, loading, allowedRoles]);

  return { profile, loading, hasAccess: !!(profile?.role && allowedRoles.includes(profile.role)) };
}
