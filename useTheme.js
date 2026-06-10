// ── useTheme hook ─────────────────────────────────────────────────────────────
import { getTheme } from '../utils/theme';

export function useTheme(themeName) {
  return getTheme(themeName);
}
