export const Colors = {
  background: '#0f0d0e',
  surface: '#1e1518',
  surfaceElevated: '#2a1e22',
  border: '#3d2530',
  primary: '#c9a227',
  primaryDark: '#a07d18',
  accent: '#8b2040',
  text: '#f5f0e8',
  textSecondary: '#c4b0a4',
  textMuted: '#7a6560',
  success: '#4a9e5c',
  warning: '#e8a020',
  error: '#e05252',
  starFilled: '#c9a227',
  starEmpty: '#3d2530',
  tabBar: '#150f11',
};

export function getDrinkStatus(
  drinkFrom: number | null,
  drinkPeakFrom: number | null,
  drinkPeakTo: number | null,
  drinkTo: number | null
): { label: string; color: string } {
  const year = new Date().getFullYear();
  if (!drinkFrom && !drinkTo) return { label: 'Unknown', color: Colors.textMuted };
  if (drinkTo && year > drinkTo) return { label: 'Past Window', color: Colors.error };
  if (drinkPeakTo && year > drinkPeakTo) return { label: 'Past Peak', color: Colors.warning };
  if (drinkPeakFrom && year >= drinkPeakFrom && drinkPeakTo && year <= drinkPeakTo)
    return { label: 'Peak Now', color: Colors.success };
  if (drinkFrom && year >= drinkFrom) return { label: 'Ready', color: Colors.primary };
  if (drinkFrom && year < drinkFrom) return { label: 'Not Yet', color: Colors.textMuted };
  return { label: 'Unknown', color: Colors.textMuted };
}
