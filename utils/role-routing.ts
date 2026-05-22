export function getHomeRoute(role: string | null | undefined): string {
  if (role === "tuineigenaar") return "/owner/dashboard";
  if (role === "tuinzoeker (met tuin)") return "/gardener/dashboard";
  return "/dashboard";
}
