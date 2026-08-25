'use client';

import { useEffect, useState } from 'react';
import styles from './BackToTop.module.css';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const updateVisibility = () => {
      frameId = 0;
      setVisible(window.scrollY > window.innerHeight);
    };

    const queueVisibilityUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener('scroll', queueVisibilityUpdate, { passive: true });
    window.addEventListener('resize', queueVisibilityUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', queueVisibilityUpdate);
      window.removeEventListener('resize', queueVisibilityUpdate);
    };
  }, []);

  const scrollToTop = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`${styles.root} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className={styles.icon} viewBox="0 0 16 18" aria-hidden="true" focusable="false">
        <path d="M3 14.5 8 9.5l5 5M3 8.5l5-5 5 5" />
      </svg>
    </button>
  );
}
