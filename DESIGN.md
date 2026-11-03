---
name: Broken Link Checker
description: A dark, instrument-grade work surface for finding dead links — cool ink ground, one signal-amber accent, and a segmented link-health strip as the signature move.
colors:
  bg: "#0f141a"
  surface: "#151c24"
  surface-2: "#1a222c"
  surface-3: "#202935"
  border: "#242f3d"
  border-strong: "#32404f"
  text: "#e9edf2"
  text-secondary: "#9daaba"
  text-muted: "#7c8b9b"
  accent: "#e5a33d"
  accent-hover: "#f0b356"
  accent-ink: "#191104"
  accent-soft: "rgba(229, 163, 61, 0.13)"
  ok: "#43b97c"
  bad: "#e15b4f"
  bad-soft: "rgba(225, 91, 79, 0.14)"
  bad-text: "#f08578"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.55rem, 3.2vw, 2.15rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 650
    letterSpacing: "-0.01em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 620
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
    fontWeight: 400
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  mono:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace"
rounded:
  sm: "6px"
  md: "10px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "0 1.6rem"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.md}"
    padding: "0 1.6rem"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: "0 1.1rem"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.sm}"
    padding: "0 0.8rem"
    height: "36px"
  field-url:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 1rem 0 2.6rem"
    height: "52px"
    typography: "{typography.mono}"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "1.1rem 1.25rem 0.9rem"
  chip-status:
    backgroundColor: "{colors.bad-soft}"
    textColor: "{colors.bad-text}"
    rounded: "{rounded.pill}"
    padding: "0.18rem 0.55rem"
  chip-status-404:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "0.18rem 0.55rem"
  segment-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "4px"
    padding: "0.32rem 0.75rem"
---

# Design System: Broken Link Checker

<!-- impeccable:design-schema 1 -->

## Overview

**Creative North Star: "The Dark Instrument"**

A precision work surface for one job: paste a URL, watch the scan, work the dead-link list, export it. The world is a cool, dim ink ground lifted one tonal step at a time — panels, tracks, wells — never by decoration. There is exactly one voice of warmth: signal amber, spent on the things you can act on (the primary button, focus, selection, the active filter, key emphasis). Everything the machine produced reads as instrument output: URLs, status codes, counters, progress, and footnotes set in a monospace with tabular figures. Nothing here performs; it reports.

The build confirms the refusal stated up front. No purple-gradient SaaS template, no terminal-hacker costume, no hero-scale marketing type, no faux-proof. Density is moderate — one screen teaches the whole job — and the motion budget is nearly zero: a single orchestrated fade when results land, the progress bar's width transition, the health strip's width easing, and a spinner while scanning. Red and green exist only to say broken or working; they are never decoration.

**Key Characteristics:**
- Cool dark ink ground; depth built from one-step-lighter panels and 1px hairline borders, plus a soft two-layer ambient shadow on raised panels
- Warm off-white text, tinted slate greys for secondary and muted roles
- A single signal-amber accent (#e5a33d) held in reserve for action and emphasis — rarity is the point
- ui-monospace with tabular figures for everything machine-produced: URLs, status codes, stat values, progress readout, limits line, footer notes
- Signature move: the full-width segmented link-health strip in the results summary — working vs broken share of checked links, encoded as data, not ornament
- Drawn stroke SVG icons throughout; no emoji, no icon font, no raster imagery (favicon is an inline SVG data URI)
- Browser surfaces themed: `::selection`, `:focus-visible`, caret, webkit scrollbars, `color-scheme: dark`

## Colors

The palette is monochrome slate plus one signal. Amber is the only saturated warm hue at rest; red and green are reserved as state colours (broken / working) and appear nowhere else.

### Primary
- **Signal Amber** (#e5a33d): the action colour. Primary "Check links" button fill, focus ring (2px outline on `:focus-visible`), `::selection` background, active filter segment, 404 status badge, broken-link URLs in the table, outline export buttons (Export JSON / Export CSV), and the brand mark. Never used as a large background wash.
- **Signal Amber Lift** (#f0b356): sole hover state of the primary button; lifts brightness, not hue.
- **Amber Ink** (#191104): text and icon colour on amber fills (primary button label, `::selection` foreground, active segment label, spinner stroke). Near-black with a warm cast.
- **Amber Wash** (rgba(229, 163, 61, 0.13)): soft accent fill — selected table rows, input/select focus glow (3px box-shadow ring), 404 badge background.

### Secondary
- **Working Green** (#43b97c): state only. "Working" stat value, the health strip's working segment, its legend dot, the empty-state check glyph. An `ok-soft` wash (rgba(67, 185, 124, 0.14)) is declared alongside it but unused as of this build — do not count it as an available accent.

### Tertiary
- **Broken Red** (#e15b4f): state only. "Broken" stat value, health strip's broken segment, legend dot, destructive-hover text/background (hide row, delete suggestion). Red wash (rgba(225, 91, 79, 0.14)) backs the default status badge, error message panel, and destructive hovers.
- **Soft-Red Legible** (#f08578): the lightened red used for text on red wash (default status badge, error message body). Straight #e15b4f on the wash loses contrast; this value exists for that pairing only.

### Neutral
- **Cool Ink** (#0f141a): page ground. Cool slate, not navy; `color-scheme: dark` is declared so browser chrome follows.
- **Raised Panel** (#151c24): the one-step-lighter surface — form card, summary panel, table container, step cards, progress bar, suggestion dropdown base sits one step higher (surface-3).
- **Panel Raised / Panel Highest** (#1a222c / #202935): surface-2 is the recessed well inside panels (URL input, max-pages input, segmented control track, suggestions hover, table-header row, row hover); surface-3 is the highest well (progress track, scrollbar-adjacent fills, suggestion dropdown, icon-button hover).
- **Hairline** (#242f3d): 1px borders on panels, table row dividers, footer/topbar borders. **Strong Hairline** (#32404f): emphasised borders — input stroke, segmented control, ghost buttons, table head underline, scrollbar thumbs.
- **Warm Paper** (#e9edf2): primary text. High contrast on Cool Ink (15.7:1).
- **Tinted Slate** (#9daaba): secondary text — subtitles, stat labels, options row, legend, footer brand, page-found links (7.8:1 on ground).
- **Muted Slate** (#7c8b9b): tertiary text — table index column, column headers, hints, placeholders, muted notes (5.3:1 on ground, 4.9:1 on panel).

### Named Rules
**The One Signal Rule.** Amber is the only warm saturated hue on screen at rest, and it stays under roughly a tenth of any view. If amber appears twice in one glance, one of them is decoration — remove it.

**The State-Only Rule.** Red and green are reserved words. They mean broken and working. They never brand, decorate, or accent anything that is not a link's health, a destructive hover, or an error. The 404 badge is the single sanctioned exception: amber, because it is the most common finding and is treated as emphasis, not failure.

**The Warm-on-Cool Rule.** All text is warm-off-white on cool slate. Never introduce a pure white (#fff) or a blue-tinted text; the temperature split is the system's whole mood.

## Typography

**Display Font:** system UI sans (`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`)
**Body Font:** same system sans stack
**Label/Mono Font:** `ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace`

**Character:** A workhorse sans paired with a terminal mono readout. The sans carries chrome and prose with tight tracking (-0.01em to -0.03em); the mono carries anything the machine produced, always with `font-variant-numeric: tabular-nums` so figures don't jitter during a scan.

### Hierarchy
- **Display** (700, clamp(1.55rem, 3.2vw, 2.15rem), 1.15, -0.03em): the single intro line "Every dead link on your site, in one list". `text-wrap: balance`, max-width 46rem block.
- **Headline** (650, 1.05rem, -0.01em): section headings — results header and "How it works".
- **Title** (620, 0.92rem): step headings inside "How it works"; footer brand runs the same family at 620/0.82rem.
- **Body** (400, 1rem base, 1.5): prose. Subtitle at 0.92rem/secondary, step copy 0.84rem capped at 44–62ch, table cells 0.82rem, compact UI at 0.78–0.85rem.
- **Label** (600, 0.7rem, +0.05em, uppercase): table column headers only, muted slate.
- **Mono figures** (ui-monospace, tabular): stat values 1.6rem/600, URLs 0.78rem, status badges 0.72rem/600, table index 0.82rem, progress readout 0.76rem, limits/footer notes 0.74–0.76rem, max-pages input 0.85rem.

### Named Rules
**The Readout Rule.** If a string was produced by the machine — a URL, an HTTP status, a count, a percentage, a timestamp, a limit — it is monospace with tabular figures. Sans never carries data.

**The One-Line Rule.** One heading level does one job: display introduces the tool, headline labels a section, title labels a step. No skipped levels, no display type below the intro.

## Layout

Single centered column. `max-width: 1120px` container, `2.5rem 1.5rem 3rem` padding, narrowing to `1.75rem 1rem 2.5rem` at ≤768px. The sticky topbar (56px, blur(8px) over rgba(21, 28, 36, 0.85)) carries the brand and the "Free · No signup" note; it is the only fixed chrome.

Above the fold: intro block (max 46rem), then the URL form card — the dominant element — then the options row. Results replace the fold's lower half in place; "How it works" (3-step grid) and the limits line close the page below. Footer is a single hairline-separated row, wrapping to a column on mobile.

Spacing rhythm is ad hoc rem, not a token scale — no spacing custom properties exist. Repeated steps: 0.5/0.6/0.75/0.8/0.9rem for tight gaps, 1.1–1.5rem for section gaps, 1.25rem card padding, 0.85rem table cell padding. Do not invent a spacing scale when extending; match these values.

Responsive behaviour is one breakpoint: **≤768px**. Summary grid goes 4→2 columns (hairline dividers shift to even children), steps grid 3→1, input group stacks vertically with full-width primary button, footer stacks. The product floor is 390px (PRODUCT.md); at that width the table scrolls horizontally inside `.table-container` (min-width 860px) rather than reflowing.

### Named Rules
**The One Canvas Rule.** One column, one width. No multi-column marketing layouts, no sidebars, no masonry — the tool is a single instrument panel.

## Elevation & Depth

Hybrid tonal layering plus one shadow. Depth reads from the tonal ladder (#0f141a → #151c24 → #1a222c → #202935) with 1px hairlines; the two-layer shadow appears only on raised panels and the suggestion dropdown to seat them on the ground. The sticky topbar is the one translucent surface (blur + 85% opacity).

### Shadow Vocabulary
- **Panel Lift** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.25)`): the only shadow token (`--shadow`). Form card, summary panel, table container, suggestion dropdown. Ambient and soft — never hard, never offset.
- **Focus Glow** (`box-shadow: 0 0 0 3px var(--accent-soft)`): the input/select focus ring, replacing the outline on text-entry surfaces.
- **Sticky Bar** (`backdrop-filter: blur(8px)` over rgba(21, 28, 36, 0.85)): topbar separation from scrolled content.

### Named Rules
**The One-Step Rule.** Depth is one tonal step and a hairline, everywhere. A surface rises by going lighter, never by gaining a stroke heavier than 1px (border-strong only for interactive affordance).

**The No-Hard-Shadow Rule.** No offset or hard-edged shadows anywhere. The world is a dim room, not a cut-paper collage.

## Shapes

Gently squared. Corners are 10px (`--radius`) on panels, inputs, the primary button; 6px (`--radius-sm`) on compact controls (max-pages input, segmented track, ghost/secondary buttons, status-filter, icon buttons, focus outline radius); full pill (999px) on progress track/fill, health strip, status badges/chips, legend dots, scrollbar thumbs. The segmented filter's active segment sits at 4px — slightly tighter than its track.

Borders are always 1px hairlines. Clipping happens only where data demands it: `overflow: hidden` on the progress track and health strip (segments are hard-clipped inside the pill), `overflow-x: auto` on the table container and suggestion list. No decorative dividers, no geometric motifs beyond the pill and the rounded rectangle.

### Named Rules
**The Hairline Rule.** Every boundary is a 1px hairline in Hairline or Strong Hairline; the only filled boundaries are amber (active filter segment) or the pill clips of data visualisation.

**The Pill-Is-Data Rule.** Fully rounded 999px shapes are reserved for data — progress, health strip, badges, dots, scrollbars — never for buttons. Buttons stay at 6–10px.

## Components

Character line for the set: tactile and confident in the primary action, quiet everywhere else — standard web controls rebuilt in the instrument vocabulary, never restyled into novelty.

### Buttons
- **Shape:** corners 6–10px; height is the size system (52px primary field row, 36–40px compact, pill never used).
- **Primary:** Signal Amber fill, Amber Ink label (650, -0.01em), padding `0 1.6rem`, 52px tall, inline-flex with 0.6rem gap; hover → Signal Amber Lift; disabled → 55% opacity, `not-allowed`. Width matches the URL field's height so the pair reads as one instrument.
- **Secondary:** transparent fill, amber text and `rgba(229, 163, 61, 0.45)` border, 6px radius, 40px tall; hover inverts to full amber fill with ink text. Used for Export JSON / Export CSV.
- **Ghost:** transparent, hairline strong border, secondary slate text, 36px; hover brightens text and border. Used for "Unhide all".
- **Icon buttons:** transparent, 15px drawn stroke SVG, muted slate; hover lifts to warm paper with surface-3 fill (copy), or red pairing (hide row, delete suggestion).

### Chips / Badges
- **Status badge (default):** red wash background, Soft-Red Legible mono text (#f08578), pill, 0.18rem 0.55rem padding, 0.72rem/600 tabular.
- **Status 404 badge:** amber wash background, Signal Amber text — 404s read as emphasis, not failure.
- **Filter chips (segmented control):** track surface-2 + strong hairline, 6px radius, 3px padding, 2px gap; inactive segments are transparent with secondary slate text (550 weight); active segment is amber fill + ink text at 4px radius. Hover lifts text to warm paper.

### Cards / Containers
- **Summary panel & form card:** surface, 1px hairline, 10px radius, Panel Lift shadow, `1.25rem` form padding / `1.1rem 1.25rem 0.9rem` summary padding.
- **Stat cell:** 4-up grid with left hairline dividers (first cell none); value in mono 1.6rem/600 tabular; Broken value red, Working value green, others warm paper; label 0.78rem secondary slate.
- **Table container:** surface, hairline, 10px radius, Panel Lift; `min-width: 860px` with horizontal scroll; header row surface-2 with uppercase 0.7rem/600 column labels and strong-hairline underline; rows separated by hairlines, hover surface-2, selected rows amber wash; index column mono muted.
- **Step cards:** surface, hairline, 10px radius, 1.25rem padding; amber 22px stroke icon, 0.92rem/620 title, 0.84rem secondary copy.

### Inputs / Fields
- **URL field:** recessed surface-2 well, 1px strong-hairline border, 10px radius, 52px tall, mono text with amber caret (`caret-color`), left-padded for the 18px drawn link glyph; placeholder is sans muted slate. Focus: outline removed, border shifts amber, 3px amber-soft glow.
- **Max-pages input:** 70px compact sibling, 6px radius, mono tabular, disabled at 40% opacity when the toggle is off. Toggle uses native checkbox with `accent-color: var(--accent)`.
- **Status filter:** surface-2 with hand-drawn SVG chevron data URI (appearance: none), 6px radius; hover/focus shift border to amber with the same soft glow.
- **Suggestion dropdown:** surface-3, strong hairline, 10px radius, max-height 220px, shadow; items separated by hairlines, hover surface-2, per-row delete affordance that turns red on hover.

### Navigation
- **Topbar only.** Sticky 56px, translucent with blur; brand = 22px drawn broken-link stroke glyph in amber + wordmark at 0.95rem/650 (-0.01em); right side is the plain-text note "Free · No signup" in mono 0.74rem secondary slate. No nav links, no menu.

### Signature: The Link-Health Strip
A full-width segmented bar inside the summary panel, between the stat grid and the legend. 6px pill, `overflow: hidden`, track surface-3, two hard-clipped segments — Working Green and Broken Red — sized by share of checked links with a 0.6s width ease. Beneath it, a legend (8px dots + labels, working/broken) with a right-aligned mono caption like "87% of 214 links healthy". It is data, not decoration: the strip encodes the single most important glance-answer the tool gives. Never amber, never animated on load beyond the width ease, never replaced by a percentage donut or gauge.

### Motion
One orchestrated entrance: `fadeIn` (0.35s ease, opacity + 8px rise) on the results container. Scan progress is a 0.25s width transition on the fill; health strip segments ease at 0.6s; the primary button spinner is `spin` 0.8s linear infinite on a 17px ring (ink stroke at 30%, top-color accent-ink). All durations collapse to ~0 under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do:
- **Do** spend amber only on the One Signal list: primary action, focus ring, selection, active filter, 404 badge, broken-link URLs, key emphasis. If it isn't one of those, it isn't amber.
- **Do** set every machine-produced string in ui-monospace with `font-variant-numeric: tabular-nums` (The Readout Rule).
- **Do** build depth from the tonal ladder + 1px hairlines; reach for `--shadow` only on raised panels and the suggestion dropdown (The One-Step Rule).
- **Do** keep red and green strictly as broken/working state (The State-Only Rule) — including hovers on destructive controls.
- **Do** keep `:focus-visible` as a 2px amber outline with 2px offset everywhere outside text-entry surfaces; keep `color-scheme: dark`, themed `::selection`, amber caret, and webkit scrollbars as shipped.
- **Do** respect `prefers-reduced-motion: reduce` — it is load-bearing, not decorative.

### Don't:
- **Don't** use amber as a decorative wash, gradient, or background block — there are no gradients anywhere in this world, and there shouldn't be.
- **Don't** introduce a second accent hue, or promote red/green to brand colours.
- **Don't** set data in the sans stack, or prose in the mono stack.
- **Don't** add hard offset shadows, glows, or neobrutalist strokes — depth is tonal, and shadows are ambient and two-layer soft (The No-Hard-Shadow Rule).
- **Don't** use emoji or icon fonts; icons are drawn 1.7–1.8 stroke-width SVG, `aria-hidden`, sized 15–34px.
- **Don't** add a second breakpoint or reflow the results table into cards; below 860px it scrolls horizontally inside its container.
- **Don't** invent proof — no user counts, testimonials, uptime claims, or certifications anywhere in this world.
