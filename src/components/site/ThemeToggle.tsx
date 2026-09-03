'use client';

import { useTheme } from '@/theme/ThemeProvider';
import { nextThemePreference, THEME_ORDER, type ThemePreference } from '@/theme/theme';
import styles from './ThemeToggle.module.css';

const labels = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const;

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'system') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.5" y="4" width="17" height="12" rx="1.5" />
        <path d="M9 20h6M12 16v4" />
      </svg>
    );
  }

  if (preference === 'light') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 15.35A8.5 8.5 0 0 1 8.65 3.5 8.5 8.5 0 1 0 20.5 15.35Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { preference, setPreference, cyclePreference } = useTheme();
  const next = nextThemePreference(preference);

  return (
    <div className={styles.root}>
      <div className={styles.desktop} role="group" aria-label="Theme preference">
        {THEME_ORDER.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === preference}
            onClick={() => setPreference(item)}
          >
            <ThemeIcon preference={item} />
            <span>{labels[item]}</span>
            {item === preference && <span className={styles.selectedIndicator} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <button
        className={styles.mobile}
        type="button"
        aria-label={`Theme: ${labels[preference]}. Switch to ${labels[next]}.`}
        onClick={cyclePreference}
      >
        <ThemeIcon preference={preference} />
      </button>
    </div>
  );
}
