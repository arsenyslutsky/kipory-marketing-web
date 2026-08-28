import type {
  FormFieldVisualProps,
  MarketingSectionVisualProps,
  NumberedRowVisualProps,
  PageHeroVisualProps,
  SectionHeaderVisualProps,
  SiteContainerVisualProps,
  SplitLayoutVisualProps,
} from './index';

export const siteContainerHomepageProps = {
  maxWidth: 1180,
  gutter: 24,
  compactGutter: 14,
} satisfies SiteContainerVisualProps;

export const marketingSectionHomepageProps = {
  tone: 'alternate',
  grid: true,
  gridFade: 'left-to-right',
  paddingTop: 110,
  paddingBottom: 110,
  gridSize: 20,
  gridOpacity: 0.22,
} satisfies MarketingSectionVisualProps;

export const splitLayoutHomepageProps = {
  contentRatio: 3,
  visualRatio: 2,
  gap: 72,
  reversed: false,
} satisfies SplitLayoutVisualProps;

export const pageHeroHomepageProps = {
  paddingTop: 164,
  paddingBottom: 96,
  headingGap: 28,
  titleMaxWidth: 9,
} satisfies PageHeroVisualProps;

export const sectionHeaderHomepageProps = {
  headerGap: 22,
  titleWidth: 700,
} satisfies SectionHeaderVisualProps;

export const numberedRowHomepageProps = {
  rowPadding: 28,
  minHeight: 132,
  numberColumnWidth: 52,
  gap: 22,
} satisfies NumberedRowVisualProps;

export const formFieldHomepageProps = {
  fieldGap: 10,
  controlPadding: 16,
  textareaHeight: 130,
} satisfies FormFieldVisualProps;
