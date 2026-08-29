import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import styles from './Typography.stories.module.css';

const displaySpecimens = [
  {
    label: 'Display / Hero',
    token: '--type-display-size-hero',
    className: 'type-display type-display-hero',
    text: 'Complex Business Processes.',
  },
  {
    label: 'Display / Page',
    token: '--type-display-size-page',
    className: 'type-display type-display-page',
    text: 'A clearer system view.',
  },
  {
    label: 'Display / Section',
    token: '--type-display-size-section',
    className: 'type-display type-display-section',
    text: 'Every signal stays connected.',
  },
  {
    label: 'Display / Compact',
    token: '--type-display-size-section-compact',
    className: 'type-display type-display-section-compact',
    text: 'Your system already tells a story.',
  },
] as const;

const colors = [
  ['Primary', '--paper', styles.primary],
  ['Secondary', '--text-secondary', styles.secondary],
  ['Muted', '--text-muted', styles.muted],
  ['Accent', '--accent', styles.accent],
  ['Control', '--text-control', styles.control],
  ['Alternate surface', '--surface-alternate-muted', styles.alternate],
] as const;

function TypographySheet() {
  return (
    <main className={styles.sheet}>
      <header className={styles.header}>
        <span className="type-control type-control-wide">Kipory typography</span>
        <h1 className="type-display type-display-section">One system for every block.</h1>
        <p className="type-body type-body-lg">
          Outfit carries display content, Crimson Pro ExtraLight carries body copy, and Chakra Petch covers accent statements, controls, and operational metadata.
        </p>
        <code className={styles.rootToken}>--type-root-size: 16px; /* change once to scale the type system */</code>
      </header>

      <section className={styles.section}>
        <h2 className={`type-control type-control-wide ${styles.sectionTitle}`}>Display hierarchy</h2>
        <div className={styles.specimenList}>
          {displaySpecimens.map((specimen) => (
            <article className={styles.specimen} key={specimen.label}>
              <div className={styles.specimenMeta}>
                <span className="type-control">{specimen.label}</span>
                <code>{specimen.token}</code>
              </div>
              <p className={`${specimen.className} ${styles.specimenText}`}>{specimen.text}</p>
            </article>
          ))}
          <article className={styles.specimen}>
            <div className={styles.specimenMeta}>
              <span className="type-control">Accent / Hero</span>
              <code>--type-accent-size-hero</code>
            </div>
            <p className={`type-accent ${styles.accentHero} ${styles.specimenText}`}>In Days. Not Quarters.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={`type-control type-control-wide ${styles.sectionTitle}`}>Body scale</h2>
        <div className={styles.bodyScale}>
          <p className={`type-body type-body-lg ${styles.bodySample}`}>Large — Hero introductions and high-priority explanatory copy.</p>
          <p className={`type-body ${styles.bodySample}`}>Medium — Capability descriptions, page leads, and long-form content.</p>
          <p className={`type-body type-body-sm ${styles.bodySample}`}>Small — Supporting descriptions and compact interface copy.</p>
          <p className={`type-body type-body-xs type-body-muted ${styles.bodySample}`}>Extra small — Dense metadata and low-emphasis supporting detail.</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={`type-control type-control-wide ${styles.sectionTitle}`}>Control scale</h2>
        <div className={styles.controlScale}>
          <span className={`type-control ${styles.controlSample} ${styles.controlXs}`}>XS / Metadata</span>
          <span className={`type-control ${styles.controlSample} ${styles.controlSm}`}>SM / Eyebrow</span>
          <span className={`type-control ${styles.controlSample} ${styles.controlMd}`}>MD / Button</span>
          <span className={`type-control ${styles.controlSample} ${styles.controlLg}`}>LG / Brand</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={`type-control type-control-wide ${styles.sectionTitle}`}>Semantic colors</h2>
        <div className={styles.colorGrid}>
          {colors.map(([label, token, className]) => (
            <article className={`${styles.colorCard} ${className}`} key={token}>
              <span>{label}</span>
              <code>{token}</code>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: TypographySheet,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
  },
} satisfies Meta<typeof TypographySheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sheet: Story = {};
