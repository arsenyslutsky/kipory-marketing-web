export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'kipory-theme';
export const THEME_ORDER = ['system', 'light', 'dark'] as const;
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0a0c0b',
  light: '#f3f5ef',
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_ORDER.includes(value as ThemePreference);
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export function nextThemePreference(preference: ThemePreference): ThemePreference {
  return THEME_ORDER[(THEME_ORDER.indexOf(preference) + 1) % THEME_ORDER.length];
}

export function applyThemeToDocument(preference: ThemePreference, resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-theme-preference', preference);
  root.style.colorScheme = resolvedTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme]);
}

export const themeBootScript = `(function(){var p='system',d=true,k='${THEME_STORAGE_KEY}',o=${JSON.stringify(THEME_ORDER)};try{var v=localStorage.getItem(k);if(o.indexOf(v)!==-1)p=v}catch(e){}try{d=window.matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}var r=p==='system'?(d?'dark':'light'):p,n=document.documentElement;n.setAttribute('data-theme',r);n.setAttribute('data-theme-preference',p);n.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',r==='dark'?'${THEME_COLORS.dark}':'${THEME_COLORS.light}')}())`;
