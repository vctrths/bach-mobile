export enum UserRole {
  TUIN_EIGENAAR = 'tuineigenaar',
  TUIN_ZOEKER = 'tuinzoeker',
  TUIN_ZOEKER_MET_TUIN = 'tuinzoeker (met tuin)',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.TUIN_EIGENAAR]: 'Tuineigenaar',
  [UserRole.TUIN_ZOEKER]: 'Tuinzoeker',
  [UserRole.TUIN_ZOEKER_MET_TUIN]: 'Tuinzoeker (met tuin)',
};

export function isValidRole(role: string | null | undefined): role is UserRole {
  return role === UserRole.TUIN_EIGENAAR ||
         role === UserRole.TUIN_ZOEKER ||
         role === UserRole.TUIN_ZOEKER_MET_TUIN;
}

export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return "Tuinzoeker";
  const lower = role.toLowerCase();
  for (const [key, label] of Object.entries(ROLE_LABELS)) {
    if (key.toLowerCase() === lower) return label;
  }
  return role;
}