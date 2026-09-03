import { readFileSync } from 'node:fs';
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { glowLinkHomepageProps } from '@/components/ui/GlowLink.presets';
import { ThemeProvider } from '@/theme/ThemeProvider';
import HomePage from './page';
import styles from './marketing.module.css';

const {
  glowLinkRender,
  horizontalHomepageProps,
  horizontalRender,
  threeDDarkHomepageProps,
  threeDLightHomepageProps,
  threeDRender,
  verticalHomepageProps,
  verticalRender,
} = vi.hoisted(() => ({
  glowLinkRender: vi.fn(),
  horizontalHomepageProps: {
    beamSpeed: 1.4,
    height: '38rem',
    width: '20rem',
  },
  horizontalRender: vi.fn(),
  threeDDarkHomepageProps: { cameraZoom: 1.1, presetVariant: 'dark' },
  threeDLightHomepageProps: { cameraZoom: 1.1, presetVariant: 'light' },
  threeDRender: vi.fn(),
  verticalHomepageProps: { height: '45rem', width: '20rem' },
  verticalRender: vi.fn(),
}));

vi.mock('@/components/site/HeroScrollEffects', () => ({
  HeroScrollEffects: ({ children, ...props }: PropsWithChildren<ComponentPropsWithoutRef<'main'>>) => (
    <main {...props}>{children}</main>
  ),
}));
vi.mock('@/components/site/BackToTop', () => ({ BackToTop: () => null }));
vi.mock('@/components/ui/GlowLink', () => ({
  GlowLink: ({ children, href, ...props }: PropsWithChildren<{ href: string }>) => {
    glowLinkRender(props);
    return <a href={href}>{children}</a>;
  },
}));
vi.mock('@/features/business-flow-3d', () => ({
  BusinessFlow3D: (props: Record<string, unknown>) => {
    threeDRender(props);
    return <div />;
  },
  businessFlow3DHomepageDarkProps: threeDDarkHomepageProps,
  businessFlow3DHomepageLightProps: threeDLightHomepageProps,
}));
vi.mock('@/features/business-flow-vertical', () => ({
  BusinessFlowVertical: (props: Record<string, unknown>) => {
    verticalRender(props);
    return <div />;
  },
  businessFlowVerticalHomepageProps: verticalHomepageProps,
}));
vi.mock('@/features/business-flow-horizontal', () => ({
  BusinessFlowHorizontal: (props: Record<string, unknown>) => {
    horizontalRender(props);
    return <figure aria-label="Horizontal business flow" />;
  },
  businessFlowHorizontalHomepageProps: horizontalHomepageProps,
}));

beforeEach(() => {
  glowLinkRender.mockClear();
  horizontalRender.mockClear();
  threeDRender.mockClear();
  verticalRender.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it('uses density-aware static workflow artwork without mounting WebGL on mobile', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList));

  const darkView = render(<ThemeProvider preference="dark"><HomePage /></ThemeProvider>);
  const darkFallbacks = Array.from(
    darkView.container.querySelectorAll<HTMLImageElement>('[data-mobile-workflow-fallback] img'),
  );

  expect(darkFallbacks.map((image) => image.parentElement?.dataset.mobileWorkflowFallback)).toEqual([
    'hero',
    'pillars',
    'delivery',
  ]);
  expect(darkFallbacks.map((image) => image.style.getPropertyValue('--mobile-workflow-dark-image'))).toEqual([
    'image-set(url("/images/workflows/mobile/hero-flow.png") 1x, url("/images/workflows/mobile/hero-flow@2x.png") 2x, url("/images/workflows/mobile/hero-flow@3x.png") 3x)',
    'image-set(url("/images/workflows/mobile/pillars-flow.png") 1x, url("/images/workflows/mobile/pillars-flow@2x.png") 2x, url("/images/workflows/mobile/pillars-flow@3x.png") 3x)',
    'image-set(url("/images/workflows/mobile/delivery-flow.png") 1x, url("/images/workflows/mobile/delivery-flow@2x.png") 2x, url("/images/workflows/mobile/delivery-flow@3x.png") 3x)',
  ]);
  expect(darkFallbacks.map((image) => [image.getAttribute('width'), image.getAttribute('height')])).toEqual([
    ['390', '780'],
    ['360', '360'],
    ['360', '608'],
  ]);

  darkView.unmount();

  const { container } = render(<ThemeProvider preference="light"><HomePage /></ThemeProvider>);
  const lightFallbacks = Array.from(
    container.querySelectorAll<HTMLImageElement>('[data-mobile-workflow-fallback] img'),
  );

  expect(lightFallbacks.map((image) => image.style.getPropertyValue('--mobile-workflow-light-image'))).toEqual([
    'image-set(url("/images/workflows/mobile/hero-flow-light.png") 1x, url("/images/workflows/mobile/hero-flow-light@2x.png") 2x, url("/images/workflows/mobile/hero-flow-light@3x.png") 3x)',
    'image-set(url("/images/workflows/mobile/pillars-flow-light.png") 1x, url("/images/workflows/mobile/pillars-flow-light@2x.png") 2x, url("/images/workflows/mobile/pillars-flow-light@3x.png") 3x)',
    'image-set(url("/images/workflows/mobile/delivery-flow-light.png") 1x, url("/images/workflows/mobile/delivery-flow-light@2x.png") 2x, url("/images/workflows/mobile/delivery-flow-light@3x.png") 3x)',
  ]);
  expect([...darkFallbacks, ...lightFallbacks].every((image) => (
    !image.getAttribute('src')?.startsWith('/images/workflows/mobile/') && !image.hasAttribute('srcset')
  ))).toBe(true);
  expect(threeDRender).not.toHaveBeenCalled();
  expect(verticalRender).not.toHaveBeenCalled();
  expect(horizontalRender).not.toHaveBeenCalled();
});

it('participates in the quiet navigation handoff', () => {
  render(<HomePage />);

  expect(screen.getByRole('main')).toHaveAttribute('data-route-transition', 'quiet-signal');
});

it('renders all shared homepage presets and replaces the delivery placeholder', () => {
  render(<HomePage />);

  const pageSourcePath = './page.tsx';
  const pageSource = readFileSync(new URL(pageSourcePath, import.meta.url), 'utf8');
  expect(pageSource).not.toMatch(/^['"]use client['"];?/);
  expect(screen.queryByText(/illustration placeholder/i)).not.toBeInTheDocument();
  const horizontalFlow = screen.getByRole('figure', { name: 'Horizontal business flow' });
  expect(horizontalFlow).toBeInTheDocument();
  expect(horizontalFlow.closest('[data-mobile-hide-visual="true"]')).toBeInTheDocument();
  expect(threeDRender.mock.calls[0][0]).toEqual(expect.objectContaining(threeDDarkHomepageProps));
  expect(verticalRender.mock.calls[0][0]).toEqual(expect.objectContaining(verticalHomepageProps));
  expect(horizontalRender).toHaveBeenCalledWith(expect.objectContaining(horizontalHomepageProps));
  expect(glowLinkRender).toHaveBeenCalledWith(expect.objectContaining(glowLinkHomepageProps));
});

it('selects an independent hero 3D preset for each resolved theme', () => {
  const darkView = render(<ThemeProvider preference="dark"><HomePage /></ThemeProvider>);

  expect(threeDRender).toHaveBeenLastCalledWith({
    ...threeDDarkHomepageProps,
    mode: 'dark',
  });

  darkView.unmount();
  threeDRender.mockClear();
  render(<ThemeProvider preference="light"><HomePage /></ThemeProvider>);

  expect(threeDRender).toHaveBeenLastCalledWith({
    ...threeDLightHomepageProps,
    mode: 'light',
  });
});

it('routes homepage conversion actions to active destinations', () => {
  render(<HomePage />);

  const destinationPaths = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
  screen.getAllByRole('link', { name: 'Let’s talk' }).forEach((link) => {
    expect(link).toHaveAttribute('href', '/contact');
  });
  expect(screen.getByRole('link', { name: 'Explore our pillars' })).toHaveAttribute('href', '#pillars');
  expect(screen.getByRole('link', { name: 'See how teams move faster' })).toHaveAttribute('href', '#delivery');
  expect(destinationPaths).toContain('/waitlist');
  expect(destinationPaths).not.toContain('/product');
  expect(destinationPaths).not.toContain('/about');
});

it('ends the homepage with compact non-glowing conversion actions', () => {
  render(<HomePage />);

  const actions = screen.getByRole('region', { name: 'End-of-page actions' });
  const waitlistLink = within(actions).getByRole('link', { name: 'Join waiting list' });
  const talkLink = within(actions).getByRole('link', { name: 'Let’s talk' });
  const delivery = screen.getByRole('region', { name: 'Everything your team needs to move faster - without compromise.' });

  expect(delivery.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(waitlistLink).toHaveClass('button', 'button--compact', 'button--accent');
  expect(talkLink).toHaveClass('button', 'button--compact', 'button--outline');
  expect(waitlistLink.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(actions).not.toHaveTextContent('↗');
  expect(actions.querySelector('[data-glow-active]')).not.toBeInTheDocument();
});

it('renders the waiting-list CTA arrow as a decorative vector icon', () => {
  render(<HomePage />);

  screen.getAllByRole('link', { name: 'Join waiting list' }).forEach((waitlistLink) => {
    expect(waitlistLink.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(waitlistLink).not.toHaveTextContent('↗');
  });
});

it('aligns the pillars separator with the fixed header after the hero jump', () => {
  render(<HomePage />);

  expect(screen.getByRole('link', { name: 'Explore our pillars' }))
    .toHaveAttribute('data-scroll-shift-rem', '0');
});

it('keeps the pillars content close to its separator', () => {
  render(<HomePage />);

  expect(screen.getByRole('region', { name: 'Our Pillars' }))
    .toHaveStyle({
      '--marketing-section-padding-top': '32px',
      '--marketing-section-padding-bottom': '12px',
    });
});

it('uses shared typography for every homepage section title', () => {
  render(<HomePage />);

  const pillarsHeader = screen.getByRole('heading', { level: 2, name: 'Our Pillars' }).closest('header');
  const deliveryHeader = screen
    .getByRole('heading', { level: 2, name: 'Everything your team needs to move faster - without compromise.' })
    .closest('header');

  expect(pillarsHeader).not.toHaveStyle({ '--section-header-title-weight': '400' });
  expect(deliveryHeader).not.toHaveStyle({ '--section-header-title-weight': '400' });
});

it('places the canonical protocol strip before the hero learn-more link', () => {
  render(<HomePage />);

  const hero = screen.getByRole('heading', { level: 1 }).closest('section');
  const protocolTitle = within(hero!).getByText('Connect & Deliver');
  const protocolLists = within(hero!).getAllByRole('list');
  const protocolLabels = protocolLists.flatMap((list) => within(list).getAllByRole('listitem')).map((item) => {
    const spans = item.querySelectorAll('span');

    return spans.item(spans.length - 1).textContent;
  });
  const protocolReveal = protocolTitle.closest('[data-hero-reveal="protocols"]');
  const protocolRoot = protocolTitle.closest('[data-coming-soon-layout]');
  const pillarsLink = within(hero!).getByRole('link', { name: 'Explore our pillars' });

  expect(protocolLabels).toEqual(['REST', 'SSE', 'JSONata', 'MCP', 'Webhook', 'GraphQL']);
  expect(protocolLists).toHaveLength(2);
  expect(protocolRoot).toHaveAttribute('data-coming-soon-layout', 'new-row');
  expect(protocolRoot).toHaveClass(styles.heroProtocolsList);
  expect(protocolReveal).not.toHaveAttribute('data-scroll-parallax');
  expect(protocolReveal?.parentElement).toHaveAttribute('data-scroll-parallax');
  expect(protocolReveal?.parentElement?.nextElementSibling).toBe(pillarsLink);
});

it('uses the accelerated-fit delivery label', () => {
  render(<HomePage />);

  expect(screen.getByText('Designed to fit and accelerate')).toBeInTheDocument();
  expect(screen.queryByText('Designed around real flow')).not.toBeInTheDocument();
});

it('uses the future-minded pillars label', () => {
  render(<HomePage />);

  expect(screen.getByText('With future in mind')).toBeInTheDocument();
  expect(screen.queryByText('From movement to meaning')).not.toBeInTheDocument();
});

it('uses complete, actionable language throughout the homepage', () => {
  render(<HomePage />);

  expect(screen.queryAllByText('Placeholder text')).toHaveLength(0);
  expect(screen.getByRole('heading', {
    level: 2,
    name: 'Everything your team needs to move faster - without compromise.',
  })).toBeInTheDocument();
  expect(screen.getByText('From idea to production')).toBeInTheDocument();
  expect(screen.getByText('Change without redeployment')).toBeInTheDocument();
  expect(screen.getByText('Governed at every layer')).toBeInTheDocument();
  expect(screen.getByText('Built for lean teams')).toBeInTheDocument();
});

it('renders every delivery detail as supporting body copy', () => {
  const { container } = render(<HomePage />);

  expect(container.querySelectorAll('#delivery article p')).toHaveLength(4);
});

it('continues delivery numbering after the three pillars', () => {
  const { container } = render(<HomePage />);
  const numbers = [...container.querySelectorAll('article')].map((article) => (
    article.querySelector('span')?.textContent
  ));

  expect(numbers).toEqual(['01', '02', '03', '04', '05', '06', '07']);
});

it('marks moving homepage text groups without marking stable section headers or illustrations', () => {
  const { container } = render(<HomePage />);

  const heroHeading = screen.getByRole('heading', { level: 1 });
  expect(heroHeading).toHaveAttribute('data-scroll-parallax');
  expect(heroHeading).toHaveAttribute('data-scroll-fade', 'false');
  expect(screen.getByText(/Kipory turns datasets/).closest('[data-scroll-parallax]'))
    .toHaveAttribute('data-scroll-parallax');
  screen.getAllByRole('heading', { level: 2 }).forEach((heading) => {
    expect(heading.closest('header')).not.toHaveAttribute('data-scroll-parallax');
  });
  container.querySelectorAll('article').forEach((row) => {
    expect(row).toHaveAttribute('data-scroll-parallax');
  });
  screen.getAllByRole('link', { name: /Explore our pillars|See how teams move faster/ }).forEach((link) => {
    expect(link).toHaveAttribute('data-scroll-parallax');
    expect(link).toHaveAttribute('data-scroll-fade', 'false');
  });
  expect(screen.getByRole('figure', { name: 'Horizontal business flow' })).not.toHaveAttribute('data-scroll-parallax');
});

it('gates the hero entrance and exposes the requested reveal stages', () => {
  const { container } = render(<HomePage />);
  const main = container.querySelector('main');
  const stages = Array.from(container.querySelectorAll<HTMLElement>('[data-hero-reveal]'));

  expect(main).toHaveAttribute('data-workflows-ready', 'false');
  expect(main).toHaveAttribute('data-content-reveal-ready', 'false');
  expect(stages.map((stage) => stage.dataset.heroReveal)).toEqual([
    'title',
    'accent',
    'lead',
    'actions',
    'protocols',
  ]);
});

it('marks both workflow sections and every numbered item for ordered reveal', () => {
  const { container } = render(<HomePage />);
  const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-section-reveal]'));

  expect(sections.map((section) => section.id)).toEqual(['pillars', 'delivery']);
  expect(sections.map((section) => (
    Array.from(section.querySelectorAll<HTMLElement>('[data-section-reveal-item]')).map((item) => (
      item.dataset.sectionRevealItem
    ))
  ))).toEqual([
    ['header', '1', '2', '3', '4'],
    ['header', '1', '2', '3', '4'],
  ]);
});
