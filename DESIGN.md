---
name: Kipory
description: A living systems blueprint for complex business flows.
colors:
  carbon-ink: "#0a0c0b"
  carbon-soft: "#151916"
  signal-field: "#0a1509"
  signal-green: "#449c40"
  signal-green-dark: "#2f702c"
  cold-paper: "#f3f5ef"
  cold-paper-soft: "#e7ebe2"
  field-text: "#edf2eb"
  field-muted: "#a4afa6"
  text-secondary: "#acb5ae"
  text-muted: "#829184"
  control-muted: "#7f947f"
  line-light: "rgba(255, 255, 255, 0.13)"
  line-field: "rgba(220, 237, 219, 0.16)"
  flow-grid: "#39473f"
  flow-green-start: "#066b43"
  flow-green-mid: "#03492b"
  flow-green-end: "#052f24"
  beam-highlight: "#c9ebc7"
  packet-core: "#f1fbf0"
typography:
  display:
    fontFamily: "Outfit, Arial, Helvetica, sans-serif"
    fontSize: "clamp(3.75rem, 8vw, 6rem)"
    fontWeight: 300
    lineHeight: 0.88
    letterSpacing: "0"
  headline:
    fontFamily: "Outfit, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.625rem, 5vw, 4.375rem)"
    fontWeight: 300
    lineHeight: 1.01
    letterSpacing: "0"
  title:
    fontFamily: "Outfit, Arial, Helvetica, sans-serif"
    fontSize: "1.5625rem"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "0"
  accent:
    fontFamily: "Oxanium, Arial, Helvetica, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: ".03rem"
  body:
    fontFamily: "Crimson Pro, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 200
    lineHeight: 1.3
    letterSpacing: "0"
  input:
    fontFamily: "Crimson Pro, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 200
    lineHeight: 1.3
    letterSpacing: "0"
  label:
    fontFamily: "Oxanium, Arial, Helvetica, sans-serif"
    fontSize: ".8125rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: ".1em"
rounded:
  square: "0"
  node-soft: "1rem"
  utility-round: "50%"
spacing:
  micro: "8px"
  tight: "12px"
  control: "20px"
  cluster: "28px"
  section: "clamp(100px, 12vw, 170px)"
components:
  button-primary:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 20px"
    height: "48px"
  button-light:
    backgroundColor: "{colors.cold-paper}"
    textColor: "{colors.carbon-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "38px"
  button-outline:
    backgroundColor: "rgba(255, 255, 255, 0.03)"
    textColor: "{colors.cold-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 20px"
    height: "48px"
  input-line:
    backgroundColor: "transparent"
    textColor: "{colors.field-text}"
    typography: "{typography.input}"
    rounded: "{rounded.square}"
    padding: "16px 0"
---

# Design System: Kipory

## Overview

**Creative North Star: "The Living Systems Blueprint"**

Kipory presents complex business processes as a precise operational field that is visibly alive. Carbon-dark surfaces hold measured grids, dashed routes, geometric nodes, and small bursts of Signal Green; the interface feels exact and restrained until motion reveals that data is actively moving through it. The system is technical without becoming sterile and kinetic without becoming noisy.

The visual language favors crisp edges, asymmetric information layouts, hairline structure, and low-luminance tonal layering. Large, light display typography provides calm authority while serif body text keeps technical explanations readable and human. Soft rounded SaaS containers are an anti-reference; brighter technical graphics remain welcome when they explain flow, state, or depth.

**Key Characteristics:**

- Carbon-dark fields punctuated by a single operational green.
- Blueprint grids, dashed connectors, and geometric flow nodes used as real information-bearing imagery.
- A three-voice type system: calm display, human body, precise control.
- Flat surfaces at rest, with glow and shadow reserved for activity, focus, and illustrated depth.
- Square controls and hairline borders instead of soft cards or decorative chrome.

## Colors

The palette is a narrow spectrum of Carbon Ink, Signal Green, and Cold Paper, expanded only where flow illustrations need dimensional or emissive detail.

### Primary

- **Signal Green** (`signal-green`): the sole global accent for primary actions, active signals, focus, selection, and the brand mark.
- **Deep Signal Green** (`signal-green-dark`): the restrained edge and low-energy companion used beneath brighter active states.

### Neutral

- **Carbon Ink** (`carbon-ink`): the default page field and the dominant visual ground.
- **Soft Carbon** (`carbon-soft`): raised dark controls and subtle hover differentiation.
- **Signal Field** (`signal-field`): the green-black alternate surface behind process content and forms.
- **Cold Paper** (`cold-paper`): primary light text and high-contrast controls.
- **Soft Cold Paper** (`cold-paper-soft`): secondary light surfaces and subdued highlights.
- **Field Text** (`field-text`): primary copy on green-black alternate surfaces.
- **Field Muted** (`field-muted`), **Secondary Text** (`text-secondary`), **Muted Text** (`text-muted`), and **Control Muted** (`control-muted`): the descending hierarchy for supporting copy, metadata, and inactive controls.
- **Light Line** (`line-light`) and **Field Line** (`line-field`): one-pixel dividers that structure dark and alternate surfaces without becoming containers.

### Tertiary

- **Flow Grid** (`flow-grid`): the subdued measuring field behind technical illustrations.
- **Flow Green Start / Mid / End** (`flow-green-start`, `flow-green-mid`, `flow-green-end`): the dimensional green face treatment for nodes.
- **Beam Highlight** (`beam-highlight`) and **Packet Core** (`packet-core`): brief high-energy values inside moving signals, never general UI accents.

Interface color values are declared once in `src/app/globals.css`. Flow-specific rendering colors are intentionally separate and centralized in `src/features/business-flow-palette.ts`; components and presets consume that palette rather than carrying literal values.

### Named Rules

**The One Signal Rule.** Signal Green owns action, focus, active flow, and brand recognition. Do not introduce a second global accent.

**The Dark Field Rule.** Product marketing surfaces begin from Carbon Ink or Signal Field; light values are content and signal, not page backgrounds.

**The Diagram Exception Rule.** Flow illustrations may become brighter and more chromatic when the added color communicates depth, direction, or activity.

## Typography

**Display Font:** Outfit (with Arial, Helvetica, sans-serif fallback)
**Body Font:** Crimson Pro (with Georgia, serif fallback)
**Accent / Control Font:** Oxanium (with Arial, Helvetica, sans-serif fallback)

**Character:** Outfit supplies open, low-weight geometric authority; Crimson Pro makes dense system explanations feel editorial and legible; Oxanium gives actions, labels, and signal language a measured technical cadence.

### Hierarchy

- **Display** (300, `clamp(3.75rem, 8vw, 6rem)`, 0.88): page-defining statements and conversion heroes; keep lines short and balanced.
- **Headline** (300, `clamp(2.625rem, 5vw, 4.375rem)`, 1.01): section-level ideas and large confirmation states.
- **Title** (300, `1.5625rem`, 1.2): cards, capability rows, and compact feature headings.
- **Accent** (300, `1.375rem`, 1): technical supporting phrases and node-adjacent language; use Signal Green selectively.
- **Body** (200, `1.3rem`, 1.3): explanatory copy, generally constrained to roughly 44–65 characters per line.
- **Input** (200, `1.25rem`, 1.3): entered values, selected options, and textareas.
- **Label** (700, `.8125rem`, `.1em`, uppercase): controls, metadata, navigation, and operational statuses.

All authored font sizes route through semantic `--type-*` tokens in `src/app/typography.css`. Components select a role from that scale; they do not introduce local numeric font sizes or color aliases.

### Named Rules

**The Three-Voice Rule.** Outfit states the idea, Crimson Pro explains it, and Oxanium operates it. Do not substitute one role for another merely for emphasis.

**The Light Authority Rule.** Display hierarchy comes from scale and spacing, not heavy font weight; primary headings remain light.

## Layout

The primary content container is capped at 1180px with 24px desktop side gutters and 14px compact gutters. The fixed header is 72px tall on desktop and 64px on compact screens. Major sections use a generous fluid vertical rhythm (`clamp(100px, 12vw, 170px)`), while dense process sections intentionally compress to 60–110px.

Desktop composition is asymmetric: primary content commonly occupies three parts to two, while the delivery section reverses attention with a roughly 2.1-to-2.9 illustration/content split. Cards and forms use aligned columns rather than isolated boxes. At 900px, two-column compositions collapse to one; at 760px, navigation and footer behavior simplify; at 620px, forms, action groups, and compact component sizing become single-column and full-width.

Grid fields use a 20px measuring cadence, dashed connector rhythms, and hairline rules. They belong behind process diagrams and form workflow surfaces, not as a generic decoration on unrelated content.

**The Structured Asymmetry Rule.** Give one side of a composition clear visual authority, then align the quieter side to its content—not to an arbitrary centered card.

## Elevation & Depth

The system is tonally layered and flat at rest. Depth comes first from shifts between Carbon Ink and Signal Field, then from one-pixel borders and inset highlights. Persistent card shadows are avoided. Glow, blur, and shadow appear when they communicate active signal energy, keyboard focus, interaction, or the physical depth of flow nodes.

### Shadow Vocabulary

- **Node Depth** (`0 4px 12px rgb(0 0 0 / 35%), inset 0 1px 0 rgb(255 255 255 / 16%)`): the flat-3D lift beneath rendered flow nodes.
- **Control Inset** (`inset 0 0 0 1px rgba(10, 12, 11, .18)`): the fine internal edge on luminous primary links.
- **Active Control Inset** (`inset 0 0 0 1px rgba(10, 12, 11, .35), inset 0 2px 7px rgba(10, 12, 11, .2)`): tactile feedback only while a luminous action is pressed.
- **Header Atmosphere** (`backdrop-filter: blur(18px)`): separation for the fixed navigation over moving content.

### Named Rules

**The Flat-Until-Alive Rule.** Surfaces remain flat until state or illustrated physics justifies depth.

## Shapes

The default interface geometry is square: buttons, form fields, panels, counters, and large containers use no corner radius. One-pixel borders and dashed rules define structure. Circles are reserved for compact utility controls, live indicators, particles, and signal bursts. Flow nodes may use softly rounded rectangles (`1rem`) or authored hexagonal clipping because their silhouette encodes topology rather than generic card styling.

**The Shape-Has-a-Job Rule.** A circle signals utility or activity; a hexagon or node silhouette communicates topology; everything else stays crisp and square.

## Components

### Buttons

Controls are compact, uppercase, and mechanically precise.

- **Shape:** square corners with a one-pixel edge where needed.
- **Primary:** Signal Green on Carbon Ink, 48px high with 20px horizontal padding.
- **Light:** Cold Paper on Carbon Ink, typically 38px high in the fixed header.
- **Outline:** transparent white tint with a quiet light border; the border resolves to Cold Paper on hover.
- **Hover / Focus:** lift 2px over 200ms; keyboard focus uses a 2px Signal Green outline offset by 4px.

### Luminous Action Link

The homepage conversion action wraps the primary surface with a restrained conic edge glow. Its shipped preset uses a compact 6px spread, 5px blur, low idle opacity, and counter-rotating 3.8s / 3.6s fields. Motion starts on hover, focus, or an explicitly active state and is removed for reduced-motion users.

### Cards / Containers

Large information regions are not rounded cards. Capability rows use square numbered counters, generous vertical padding, and dashed field-colored separators. Confirmation states use a square, ruled panel with a low-energy green-black gradient and a single hairline Signal Green edge.

### Inputs / Fields

Inputs, selects, and textareas are transparent and borderless except for a one-pixel bottom rule. Input text uses the shared `--type-body-size-input` role; labels use the shared uppercase control role. Focus changes the bottom rule and caret to Signal Green. Selects preserve the dark surface palette and retain a pointer cursor; text-entry controls retain the text cursor.

### Navigation

The navigation is a fixed, blurred Carbon Ink bar with a 72px desktop height. The brand mark and wordmark sit left; a restrained uppercase text link and high-contrast waiting-list action sit right. At 760px, the text navigation hides while the conversion action remains available.

### Success Panel

Submitted forms are replaced in place by an accessible status panel. The panel focuses itself, announces its heading, and reveals with a 220ms clip-and-translate motion. The background gradient concentrates Signal Green toward the lower-right; a drawn check and square status marker complete the operational acknowledgment.

### Flow Illustrations

Horizontal, vertical, and 3D flows share Node3D geometry, dashed connectors, configurable outline progress states, and Signal Green beam motion. Their glow and shadow may be more expressive than general UI because they visualize process activity. Preserve reduced-motion fallbacks and keep surrounding layout interaction-free.

## Do's and Don'ts

### Do:

- **Do** use Signal Green for actions, focus, live flow, and state changes—not for broad decorative fills.
- **Do** keep large surfaces square and let hairlines, tonal layers, and spacing create hierarchy.
- **Do** preserve the Outfit / Crimson Pro / Oxanium role split.
- **Do** use brighter greens, highlights, and dimensional shading inside technical illustrations when they clarify movement or depth.
- **Do** pair motion with a useful event and provide a reduced-motion equivalent.
- **Do** keep body copy readable against dark fields and within a controlled measure.

### Don't:

- **Don't** introduce soft rounded cards, pill-shaped primary actions, or generic dashboard containers.
- **Don't** replace the dark operational palette with a bright SaaS canvas.
- **Don't** apply persistent glow or shadow to static content.
- **Don't** use blueprint grids when the surface has no process, measurement, or workflow meaning.
- **Don't** replace authored flow diagrams with generic stock illustration or decorative icon tiles.
