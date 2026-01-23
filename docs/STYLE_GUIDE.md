# DTU Salsa Wiki - Style Guide

This document defines the visual design patterns and component styles for the DTU Salsa Wiki. Use this as a reference when building or updating UI components to ensure consistency across the site.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Decorative Elements](#decorative-elements)
4. [Components](#components)
5. [Layout Patterns](#layout-patterns)
6. [Spacing](#spacing)
7. [Transitions & Animations](#transitions--animations)
8. [Dark Mode](#dark-mode)
9. [Search Implementation](#search-implementation)
10. [Accessibility](#accessibility)
11. [Mobile Considerations](#mobile-considerations)
12. [File Organization](#file-organization)
13. [Quick Reference](#quick-reference)

---

## Color System

### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | `#121212` | `#fff` | Primary text, headings |
| `accent` | `#a388f5` | `#a388f5` | Highlights, interactive elements, decorative |
| `body` | `#fff` | `#1c1c1c` | Page background |
| `border` | `#eaeaea` | `#3e3e3e` | Borders, dividers |
| `light` | `#f6f6f6` | `#222222` | Subtle backgrounds |
| `theme-light` | `#f8f8f8` | `#2a2a2a` | Card backgrounds, input backgrounds |

### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `text` | `#444444` | `#b4afb6` | Body text |
| `text-dark` | `#040404` | `#fff` | Headings, emphasized text |
| `text-light` | `#717171` | `#b4afb6` | Secondary text, captions |

### Level Colors (for difficulty indicators)

| Level | Light Mode | Dark Mode |
|-------|------------|-----------|
| Beginner | `#22c55e` | `#4ade80` |
| Intermediate | `#eab308` | `#facc15` |
| Advanced | `#ef4444` | `#f87171` |

### Color Usage Guidelines

- **Accent color (`#a388f5`)** is the signature color - use it sparingly for:
  - Highlighted words in headings
  - Hover states on interactive elements
  - Decorative background gradients
  - Active states and focus indicators
  - Search result highlights

- **Do NOT use accent color for:**
  - Star ratings (use yellow `#facc15`)
  - Type labels on cards (use gray)

- Always pair light/dark mode variants using the pattern:
  ```html
  class="text-accent dark:text-darkmode-accent"
  class="bg-accent/20 dark:bg-darkmode-accent/20"
  ```

---

## Typography

### Font Hierarchy

- **Primary font**: System font stack (configured via `--font-primary`)
- **Secondary font**: Same as primary (for headings)

### Heading Sizes

| Class | Desktop | Mobile |
|-------|---------|--------|
| `h1` / `.h1` | `2.985984rem` | `2.687rem` |
| `h2` / `.h2` | `2.488rem` | `2.239rem` |
| `h3` / `.h3` | `2.073rem` | `1.866rem` |
| `h4` / `.h4` | `1.728rem` | `1.555rem` |

### Text Styles

```html
<!-- Hero headline with accent highlight -->
<h1 class="text-h2 md:text-h1 lg:text-[3.5rem] font-bold leading-tight">
  Master Your <span class="text-accent dark:text-darkmode-accent">Salsa</span> Moves
</h1>

<!-- Page header with accent highlight -->
<h1 class="text-h2 md:text-h1 font-bold mb-2">
  Browse <span class="text-accent dark:text-darkmode-accent">Moves</span>
</h1>

<!-- Subtitle/description -->
<p class="text-lg md:text-xl text-text-light dark:text-darkmode-text-light">
  Description text here
</p>

<!-- Small/caption text -->
<span class="text-sm text-text-light dark:text-darkmode-text-light">
  Caption text
</span>

<!-- Uppercase label -->
<span class="text-xs font-bold uppercase tracking-wider text-gray-400">
  Label
</span>
```

---

## Decorative Elements

### Background Gradients

Use subtle gradients with the accent color for hero sections and feature areas:

```html
<div class="bg-gradient-to-br from-accent/20 via-accent/5 to-transparent dark:from-darkmode-accent/20 dark:via-darkmode-accent/5 dark:to-transparent">
```

### Blurred Decorative Circles

Create depth and visual interest with blurred background orbs:

```html
<!-- Large blurred circle - top left -->
<div class="absolute top-20 left-10 w-72 h-72 bg-accent/30 dark:bg-darkmode-accent/20 rounded-full blur-3xl"></div>

<!-- Larger circle - bottom right -->
<div class="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 dark:bg-darkmode-accent/15 rounded-full blur-3xl"></div>

<!-- Center circle -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 dark:bg-darkmode-accent/10 rounded-full blur-3xl"></div>
```

**Guidelines:**
- Use 2-3 circles maximum per section
- Vary sizes (w-72, w-96, w-[500px])
- Use decreasing opacity (30%, 20%, 10%)
- Always use `blur-3xl` for soft edges
- Position with absolute positioning
- Parent container needs `overflow-hidden` and `relative`

---

## Components

### Search Bar (Hero Style)

Large, prominent search bar for hero sections:

```html
<div
  data-search-trigger
  class="cursor-pointer bg-white dark:bg-darkmode-body rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3 max-w-xl mx-auto border-2 border-border dark:border-darkmode-border hover:border-accent dark:hover:border-darkmode-accent transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 group"
>
  <svg class="text-gray-400 group-hover:text-accent dark:group-hover:text-darkmode-accent transition-colors">
    <!-- search icon -->
  </svg>
  <span class="text-gray-400 text-lg">Search placeholder...</span>
  <span class="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-darkmode-light border border-gray-200 dark:border-darkmode-border rounded-lg px-2 py-1 font-mono">
    ⌘K
  </span>
</div>
```

**Key features:**
- `rounded-2xl` for large border radius
- `shadow-xl` with `hover:shadow-2xl hover:shadow-accent/10`
- `border-2` that changes to accent on hover
- `group` class for coordinated hover effects

### Search Bar (Inline/Filter Style)

Compact search bar for browse pages:

```html
<div class="relative flex-1">
  <IoSearch class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
  <input
    type="text"
    placeholder="Search moves..."
    class="w-full pl-12 pr-4 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border focus:border-accent dark:focus:border-darkmode-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:focus:ring-darkmode-accent/20 transition-all"
  />
</div>
```

### Search Modal

Full-screen search modal with results:

```css
/* Key classes */
.search-modal { /* Fixed overlay container */ }
.search-wrapper { /* rounded-2xl, shadow-2xl, max-w-[720px] */ }
.search-wrapper-header { /* Search input with icon */ }
.search-wrapper-body { /* Scrollable results area */ }
.search-wrapper-footer { /* Keyboard shortcuts */ }
.search-result-item { /* rounded-xl cards with hover states */ }
```

**Result item hover states:**
- Border changes to accent
- Background gets subtle accent tint
- Title color changes to accent
- Smooth transition

### Cards

Standard card component with hover effects:

```html
<a
  href="/moves/example"
  class="block bg-white dark:bg-darkmode-body rounded-2xl p-6 h-full border border-border dark:border-darkmode-border hover:border-accent/50 dark:hover:border-darkmode-accent/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
>
  <!-- Type label (gray, not accent) -->
  <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
    Turn Pattern
  </span>

  <!-- Title -->
  <h3 class="text-lg font-bold text-text-dark dark:text-darkmode-text-dark mt-2 mb-2">
    Cross Body Lead
  </h3>

  <!-- Level indicator dot -->
  <span class="w-2 h-2 rounded-full bg-level-beginner dark:bg-darkmode-level-beginner"></span>

  <!-- Star rating (yellow, not accent) -->
  <StarRatingDisplay rating={3} />
</a>
```

**Card hover effects:**
- `-translate-y-1` lift effect
- `shadow-lg` elevation
- Border color changes to `accent/50`
- Duration: 300ms

### MultiSelect Dropdown

Custom dropdown with checkboxes:

```html
<div class="relative">
  <button
    class="w-full px-4 py-3 bg-white dark:bg-darkmode-body rounded-xl border border-border dark:border-darkmode-border hover:border-accent/50 dark:hover:border-darkmode-accent/50 text-left flex justify-between items-center transition-all"
  >
    <span>2 selected</span>
    <IoChevronDown class="w-5 h-5 text-gray-400" />
  </button>

  <!-- Dropdown -->
  <div class="absolute z-20 w-full mt-2 bg-white dark:bg-darkmode-body border border-border dark:border-darkmode-border rounded-xl shadow-lg overflow-hidden">
    <div class="max-h-60 overflow-auto py-2">
      <!-- Option with checkbox -->
      <button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-light dark:hover:bg-darkmode-light">
        <span class="w-5 h-5 rounded border-2 border-accent bg-accent flex items-center justify-center">
          <IoCheckmark class="w-3 h-3 text-white" />
        </span>
        <span class="text-sm font-medium">Option Label</span>
      </button>
    </div>
  </div>
</div>
```

### Filter Pills (Active Filters)

Show active filter selections:

```html
<button
  class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-accent/10 text-accent dark:bg-darkmode-accent/10 dark:text-darkmode-accent rounded-full hover:bg-accent/20 dark:hover:bg-darkmode-accent/20 transition-colors"
>
  beginner
  <IoClose class="w-3 h-3" />
</button>
```

### Explorer Sidebar

Collapsible navigation sidebar with folders:

```html
<aside class="bg-white dark:bg-darkmode-body rounded-2xl border border-border dark:border-darkmode-border overflow-hidden">
  <!-- Section header -->
  <div class="p-5">
    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
      Connections
    </div>

    <!-- Folder -->
    <div class="explorer-folder" data-expanded="true">
      <button class="folder-trigger w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-light dark:hover:bg-darkmode-light">
        <IoChevronForward class="icon-chevron text-gray-400 text-xs transition-transform duration-200" />
        <span class="text-sm font-semibold flex-1">Setup Moves</span>
        <span class="text-xs font-medium text-gray-400 bg-light dark:bg-darkmode-light px-2 py-0.5 rounded-full">
          5
        </span>
      </button>

      <!-- Folder content -->
      <div class="folder-content pl-5 flex flex-col gap-0.5 mt-1">
        <a href="/moves/example" class="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-light dark:hover:bg-darkmode-light group">
          <FaRunning class="text-gray-400 group-hover:text-accent" />
          <span class="text-sm truncate flex-1">Move Title</span>
          <span class="w-2 h-2 rounded-full bg-level-beginner"></span>
        </a>
      </div>
    </div>
  </div>
</aside>
```

### Pagination

Simple pagination with rounded buttons:

```html
<nav class="flex items-center justify-center gap-2 mt-12">
  <!-- Previous -->
  <button class="w-10 h-10 rounded-xl hover:bg-light dark:hover:bg-darkmode-light">
    <IoChevronBack />
  </button>

  <!-- Page number (current) -->
  <span class="w-10 h-10 rounded-xl bg-accent text-white font-medium flex items-center justify-center">
    1
  </span>

  <!-- Page number -->
  <button class="w-10 h-10 rounded-xl hover:bg-light dark:hover:bg-darkmode-light font-medium">
    2
  </button>

  <!-- Next -->
  <button class="w-10 h-10 rounded-xl hover:bg-light dark:hover:bg-darkmode-light">
    <IoChevronForward />
  </button>
</nav>
```

### Breadcrumbs

Navigation breadcrumbs:

```html
<nav class="mb-4">
  <ol class="flex items-center gap-2 text-sm">
    <li>
      <a href="/" class="text-text-light hover:text-accent transition-colors">Home</a>
    </li>
    <li class="text-gray-400">/</li>
    <li>
      <a href="/moves" class="text-text-light hover:text-accent transition-colors">Moves</a>
    </li>
    <li class="text-gray-400">/</li>
    <li class="text-text-dark font-medium">Cross Body Lead</li>
  </ol>
</nav>
```

### View All Link

Text link with animated arrow:

```html
<a
  href="/moves"
  class="group inline-flex items-center gap-3 text-accent dark:text-darkmode-accent font-medium hover:gap-4 transition-all"
>
  View All Moves
  <span class="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 dark:bg-darkmode-accent/10 group-hover:bg-accent dark:group-hover:bg-darkmode-accent transition-colors">
    <FaArrowRight class="w-3 h-3 group-hover:text-white transition-colors" />
  </span>
</a>
```

### Level Badge

Colored badge for difficulty level:

```html
<span class="px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider bg-level-beginner/10 text-level-beginner dark:bg-darkmode-level-beginner/10 dark:text-darkmode-level-beginner">
  beginner
</span>
```

### Buttons

```html
<!-- Primary button -->
<button class="px-5 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors">
  Primary Action
</button>

<!-- Ghost/text button -->
<button class="py-3 text-text-light hover:text-text-dark transition-colors">
  Reset All
</button>

<!-- Icon button -->
<button class="p-2 hover:bg-light dark:hover:bg-darkmode-light rounded-lg transition-colors">
  <IoClose class="w-6 h-6" />
</button>
```

### Stat Display

For showing counts/metrics:

```html
<div class="flex items-center justify-center gap-8 md:gap-12 text-sm">
  <div class="text-center">
    <div class="text-2xl md:text-3xl font-bold text-text-dark dark:text-darkmode-text-dark">
      42
    </div>
    <div class="text-text-light dark:text-darkmode-text-light">
      Moves
    </div>
  </div>
  <div class="w-px h-10 bg-border dark:bg-darkmode-border"></div>
  <!-- more stats -->
</div>
```

### Empty State

When no results are found:

```html
<div class="text-center py-16 bg-light/50 dark:bg-darkmode-light/50 rounded-2xl">
  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 dark:bg-darkmode-accent/10 flex items-center justify-center">
    <IoSearch class="w-8 h-8 text-accent dark:text-darkmode-accent" />
  </div>
  <h3 class="text-lg font-bold mb-2">No moves found</h3>
  <p class="text-text-light dark:text-darkmode-text-light mb-6">
    Try adjusting your filters or search query
  </p>
  <button class="px-5 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors">
    Clear All Filters
  </button>
</div>
```

---

## Layout Patterns

### Hero Section

Full-viewport hero with centered content and decorative background:

```html
<section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
  <!-- Background gradient -->
  <div class="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent dark:from-darkmode-accent/20 dark:via-darkmode-accent/5 dark:to-transparent"></div>

  <!-- Decorative blurred circles -->
  <div class="absolute ..."></div>

  <!-- Content -->
  <div class="container relative z-10">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Hero content -->
    </div>
  </div>
</section>
```

### Browse Page Layout

Two-column layout with sidebar filters:

```html
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <!-- Desktop Sidebar Filters -->
  <div class="hidden lg:block lg:col-span-3">
    <div class="bg-white dark:bg-darkmode-body p-6 rounded-2xl border border-border dark:border-darkmode-border sticky top-24">
      <!-- Filter content -->
    </div>
  </div>

  <!-- Results Grid -->
  <div class="lg:col-span-9">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Cards -->
    </div>
  </div>
</div>
```

### Detail Page Layout

Content with sidebar:

```html
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <!-- Sidebar (Left on Desktop, Bottom on Mobile) -->
  <div class="lg:col-span-3 order-2 lg:order-1">
    <ExplorerSidebar />
  </div>

  <!-- Main Content (Right on Desktop, Top on Mobile) -->
  <article class="lg:col-span-9 order-1 lg:order-2">
    <Breadcrumbs />
    <!-- Content -->
  </article>
</div>
```

### Mobile Filter Drawer

Slide-in filter panel for mobile:

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />

<!-- Drawer (slides from right) -->
<div class="fixed inset-y-0 right-0 w-full max-w-sm bg-body dark:bg-darkmode-body z-50 transform transition-transform duration-300 translate-x-0">
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-border">
      <h2 class="text-lg font-bold">Filters</h2>
      <button class="p-2 hover:bg-light rounded-lg">
        <IoClose class="w-6 h-6" />
      </button>
    </div>

    <!-- Content (scrollable) -->
    <div class="flex-1 overflow-y-auto p-4">
      <!-- Filters -->
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-border space-y-3">
      <button class="w-full py-3 text-center text-text-light">Reset All</button>
      <button class="w-full py-3 bg-accent text-white rounded-xl font-medium">
        Show 24 Results
      </button>
    </div>
  </div>
</div>
```

### Content Section

Standard content section with consistent spacing:

```html
<section class="section-sm">
  <div class="container">
    <div class="flex justify-between items-end mb-8">
      <h2 class="h3 mb-0">Section Title</h2>
      <a href="#" class="group inline-flex items-center gap-3 text-accent font-medium">
        View All <span class="..."><FaArrowRight /></span>
      </a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- items -->
    </div>
  </div>
</section>
```

### Footer

Two-part footer with main content and disclaimer:

```html
<footer class="bg-light dark:bg-darkmode-light border-t border-border dark:border-darkmode-border">
  <div class="container">
    <!-- Main content: py-8 lg:py-10 -->
    <!-- Divider: border-t -->
    <!-- Bottom bar with disclaimer: py-5, text-xs -->
  </div>
</footer>
```

---

## Spacing

### Standard Spacing Scale

- `gap-2` / `gap-3` - Tight spacing (icons with text)
- `gap-6` / `gap-8` - Medium spacing (between related elements)
- `gap-12` - Large spacing (between sections)
- `mb-6` - Standard heading margin
- `mb-8` / `mb-10` - Section element spacing
- `py-8` / `py-10` - Section vertical padding

### Container

Always wrap content in `.container` for consistent max-width and horizontal padding.

### Border Radius Scale

| Class | Usage |
|-------|-------|
| `rounded-md` | Small elements, kbd |
| `rounded-lg` | Buttons, list items |
| `rounded-xl` | Inputs, dropdown items, pagination |
| `rounded-2xl` | Cards, modals, sidebars |
| `rounded-full` | Pills, badges, avatars |

---

## Transitions & Animations

### Standard Transitions

```html
<!-- Color transitions -->
class="transition-colors"

<!-- All properties with duration -->
class="transition-all duration-300"

<!-- Transform transitions -->
class="transition-transform duration-200"
```

### Hover Effects

1. **Border color change**: `hover:border-accent dark:hover:border-darkmode-accent`
2. **Shadow elevation**: `hover:shadow-lg` or `hover:shadow-2xl hover:shadow-accent/10`
3. **Icon color**: Use `group` and `group-hover:text-accent`
4. **Lift effect**: `hover:-translate-y-1`
5. **Gap expansion**: `hover:gap-4` (for arrow links)

### Folder Toggle Animation

```css
.explorer-folder[data-expanded="true"] .icon-chevron {
  transform: rotate(90deg);
}
```

### Pulse Animation

For status indicators:
```html
<span class="animate-pulse"></span>
```

---

## Dark Mode

### Implementation Pattern

Always provide dark mode variants using the `dark:` prefix:

```html
class="bg-white dark:bg-darkmode-body"
class="text-text dark:text-darkmode-text"
class="border-border dark:border-darkmode-border"
```

### Opacity Adjustments

Dark mode often needs slightly lower opacity for decorative elements:

```html
class="bg-accent/30 dark:bg-darkmode-accent/20"
```

---

## Search Implementation

### MiniSearch Configuration

The site uses MiniSearch for fast, client-side search with these optimizations:

```typescript
const miniSearch = new MiniSearch({
  fields: [
    "frontmatter.title",
    "frontmatter.aliases",
    "frontmatter.description",
    "content",
  ],
  // Extract nested fields
  extractField: (document, fieldName) => {
    const value = fieldName.split(".").reduce((doc, key) => doc?.[key], document);
    return Array.isArray(value) ? value.join(" ") : value;
  },
  // Custom tokenizer
  tokenize: (text) => text.toLowerCase().split(/[\s\-_/]+/).filter(Boolean),
  searchOptions: {
    prefix: true,                    // Match partial words
    fuzzy: (term) => {               // Dynamic fuzziness
      if (term.length <= 2) return 0;
      if (term.length <= 4) return 0.1;
      return 0.2;
    },
    combineWith: "OR",               // Broader results
    boost: {                         // Field importance
      "frontmatter.title": 4,
      "frontmatter.aliases": 3,
      "frontmatter.description": 1.5,
    },
  },
});
```

### Search Result Highlighting

Use the accent color for highlighting matches:

```html
<mark class="bg-accent/20 dark:bg-darkmode-accent/20 text-accent dark:text-darkmode-accent rounded px-0.5 font-medium">
  matched text
</mark>
```

### useSearch Hook

Reusable hook at `src/lib/hooks/useSearch.ts`:

```typescript
const { search } = useSearch({
  items: allData,
  fields: ["frontmatter.title", "frontmatter.aliases"],
  boostFields: { "frontmatter.title": 3 },
});

const results = search(query);
```

---

## Accessibility

### Focus States

Ensure all interactive elements have visible focus states (handled by default with Tailwind).

### ARIA Labels

```html
<button aria-label="Open navigation menu" aria-expanded="false">
<button aria-label="Close filter drawer">
<nav aria-label="Pagination">
```

### Keyboard Navigation

- `Escape` closes modals and drawers
- `Cmd/Ctrl + K` opens search
- Arrow keys navigate search results
- `Enter` selects search result

### Color Contrast

- Text on backgrounds must meet WCAG AA standards
- Don't rely solely on color to convey information
- Level indicators have both color AND text labels

---

## Mobile Considerations

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile-First Patterns

```html
<!-- Text sizing -->
class="text-h2 md:text-h1 lg:text-[3.5rem]"

<!-- Spacing -->
class="gap-8 md:gap-12"

<!-- Layout -->
class="flex-col lg:flex-row"

<!-- Visibility -->
class="hidden lg:block"
class="lg:hidden"
```

### Mobile Navigation

- Drawer-style navigation on mobile (slides from left)
- Hamburger icon (left) + Title (center) + Search (right) layout
- Semi-transparent overlay with `backdrop-blur-sm`
- Close on: X button, overlay click, Escape key, or link click
- Body scroll lock when open

### Mobile Filter Drawer

- Slides from right (opposite of nav)
- Full height with header/content/footer sections
- Shows result count in footer button
- Body scroll lock when open

---

## File Organization

```
src/
├── lib/
│   └── hooks/
│       └── useSearch.ts      # MiniSearch hook
├── styles/
│   ├── main.css              # Theme variables, imports
│   ├── base.css              # Base element styles
│   ├── components.css        # Reusable component styles
│   ├── navigation.css        # Header/nav specific styles
│   ├── buttons.css           # Button variants
│   └── search.css            # Search modal styles
├── layouts/
│   ├── helpers/
│   │   ├── Card.tsx          # Content card
│   │   ├── Badge.tsx         # Status badge
│   │   ├── MultiSelect.tsx   # Dropdown filter
│   │   ├── Pagination.tsx    # Page navigation
│   │   ├── SearchModal.tsx   # Global search
│   │   ├── SearchResult.tsx  # Search result item
│   │   ├── MovesBrowse.tsx   # Moves listing
│   │   ├── ConceptsBrowse.tsx # Concepts listing
│   │   └── ExplorerSidebar.astro # Detail page sidebar
│   └── partials/
│       ├── Header.astro
│       └── Footer.astro
└── pages/
    ├── index.astro
    ├── moves/
    │   ├── index.astro
    │   └── [...slug].astro
    └── concepts/
        ├── index.astro
        └── [...slug].astro
```

---

## Quick Reference

### Most Used Classes

```
Background:     bg-body, bg-light, bg-white, bg-accent/10
Text:           text-text, text-text-dark, text-text-light, text-accent
Border:         border-border, border-accent/50, border-2
Radius:         rounded-lg, rounded-xl, rounded-2xl, rounded-full
Shadow:         shadow-lg, shadow-xl, shadow-2xl
Blur:           blur-3xl, backdrop-blur-sm
Transition:     transition-colors, transition-all duration-300
```

### Color Opacity Scale

For backgrounds and decorative elements:
- `/5` - Barely visible
- `/10` - Subtle tint
- `/15` - Light presence
- `/20` - Noticeable
- `/30` - Prominent
- `/50` - Half opacity (borders on hover)

### Icon Sizes

- `w-3 h-3` - Tiny (in pills/badges)
- `w-4 h-4` - Small (inline with text)
- `w-5 h-5` - Standard (buttons, inputs)
- `w-6 h-6` - Medium (close buttons)
- `w-8 h-8` - Large (empty states)

### Z-Index Scale

- `z-10` - Above content (hero text over background)
- `z-20` - Dropdowns
- `z-40` - Overlays
- `z-50` - Modals and drawers
