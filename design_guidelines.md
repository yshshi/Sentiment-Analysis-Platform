# Sentiment Analysis App - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design-inspired with modern refinements)

**Rationale:** This is a utility-focused data analysis tool where clarity, usability, and data visualization take priority. The interface should feel professional, trustworthy, and efficient while remaining approachable.

---

## Core Design Elements

### Typography
- **Primary Font:** Inter (via Google Fonts CDN) - clean, modern, excellent readability
- **Heading Scale:** 
  - H1: 3xl/4xl - Main page title "Sentiment Analysis Platform"
  - H2: 2xl - Section headers "File Upload Analysis", "Live Analysis"
  - H3: xl - Card titles, chart labels
  - Body: base - Reviews, descriptions, results
  - Small: sm - Metadata, helper text
- **Font Weights:** 
  - Regular (400) for body text
  - Medium (500) for labels and emphasis
  - Semibold (600) for headings and CTAs

### Layout System
- **Spacing Units:** Consistently use Tailwind units of 4, 6, 8, 12, 16, 20, 24
- **Container:** max-w-7xl centered with px-4 md:px-6 lg:px-8
- **Section Padding:** py-12 on mobile, py-16 on desktop
- **Card Spacing:** gap-6 between cards, p-6 internal padding
- **Component Gaps:** gap-4 for form elements, gap-8 for major sections

---

## Page-Specific Layouts

### Homepage (/)
**Layout:** Single-column centered container with two prominent card sections stacked vertically

**Header Section:**
- Centered H1 title with subtitle explaining the platform
- Concise description (1-2 lines) about analyzing sentiment from files and live input
- Top padding: pt-16, bottom: pb-12

**Two Main Cards (Grid on Desktop):**
Use `grid grid-cols-1 lg:grid-cols-2 gap-8` to place cards side-by-side on large screens

**Card A - File Upload Analysis:**
- Large, prominent upload dropzone with dashed border and upload icon (cloud-upload from Heroicons)
- "Drop CSV, XLSX, or PDF file here or click to browse" text
- Supported formats list (small text below)
- Primary action button "Analyze File" (disabled until file selected)
- File name display when file is selected
- Progress indicator/loader during upload

**Card B - Live Sentiment Analysis:**
- Tabbed interface or stacked sections for "Text Input" and "Voice Input"
- **Text Section:**
  - Large textarea (min-height h-32) with placeholder "Enter text to analyze..."
  - Character counter (optional, small text)
  - Analyze button below textarea
- **Voice Section:**
  - Large microphone button (circular, prominent) with recording state animation
  - "Tap to speak" instruction text
  - Waveform or pulsing animation during recording
  - Transcribed text display area
- **Result Display:** 
  - Appears below input after analysis
  - Large sentiment badge (Positive/Negative/Neutral) with appropriate visual treatment
  - Confidence score if applicable

### Results Page (/results)
**Layout:** Centered content with max-w-5xl

**Summary Section:**
- Total reviews analyzed count (large number display)
- Upload date/time metadata

**Pie Chart Section:**
- Centered chart (max-w-md on desktop, full width on mobile)
- Chart.js doughnut chart with three segments (Positive, Negative, Neutral)
- Legend below chart showing percentages
- Interactive hover states on segments
- Click instruction text: "Click on any segment to view detailed reviews"

**Sentiment Distribution Cards (Below Chart):**
- Three horizontal cards in a grid showing counts
- Each card displays sentiment type, count, and percentage
- Clickable with hover elevation effect
- Icons from Heroicons (check-circle, x-circle, minus-circle)

### Details Page (/details/:sentiment)
**Layout:** Full-width list with filtering sidebar (optional)

**Header:**
- Back button to results
- H1 showing sentiment type (e.g., "Positive Reviews")
- Total count badge
- Optional: Filter/search bar

**Review List:**
- Card-based layout for each review
- Each card contains:
  - Review text (truncated if long with "Read more" expansion)
  - Metadata if available (date, rating)
  - Visual sentiment indicator (colored dot or icon)
- Pagination or infinite scroll for large datasets
- Empty state if no reviews: centered message with illustration placeholder

---

## Component Library

### Cards
- Subtle border with rounded-lg corners
- Gentle shadow (shadow-sm default, shadow-md on hover)
- White/light background with p-6 padding
- Transition on hover: slight elevation change

### Buttons
- **Primary:** Solid fill, medium height (h-10 to h-12), px-6, rounded-lg
- **Secondary:** Outline style with transparent background
- **Icon Buttons:** Circular (rounded-full) for mic button, square for utility actions
- All buttons: transition-all duration-200 for smooth state changes

### File Upload Zone
- Dashed border (border-dashed border-2)
- Large drop area (min-h-48 or min-h-64)
- Centered icon and text
- Drag-over state: border highlight
- Error state: red border for invalid files

### Loading States
- Spinner: Use Heroicons animated spinner icon
- Skeleton screens for data loading (shimmer effect on cards)
- Progress bars for file uploads
- Overlay with backdrop-blur when processing

### Data Visualization
- Pie Chart: Three distinct segments with clear labels
- Hover tooltips showing exact values
- Responsive sizing (scales down on mobile)
- Click cursor on interactive elements

### Forms
- Input fields: border rounded-md, h-10 to h-12 height
- Focus states: ring-2 with offset
- Labels: text-sm font-medium, mb-2 spacing
- Textarea: rounded-lg with resize-vertical

### Sentiment Badges
- Rounded-full pills with px-4 py-1.5
- Icon + text combination
- Three visual variants (positive, negative, neutral - styling handled by component)

---

## Navigation
- Simple top navbar (if multi-page) with logo/title left, navigation right
- Breadcrumbs on results/details pages
- Sticky positioning for navbar (sticky top-0)

---

## Responsive Behavior
- **Mobile (base):** Single column, stacked cards, full-width charts
- **Tablet (md):** Two-column grid for certain sections
- **Desktop (lg):** Side-by-side layouts, expanded visualizations
- Touch-friendly tap targets (min 44x44px)

---

## Micro-interactions
- Use sparingly - only for feedback
- Button press states (scale-95 active)
- Card hover elevations
- Recording pulse animation for microphone
- Smooth transitions (duration-200 to duration-300)

---

## Accessibility
- Maintain WCAG AA contrast ratios
- Focus indicators on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation for pie chart
- Screen reader text for loading states

---

## Images
**No large hero image required.** This is a utility application focused on functionality. Use icons from Heroicons library for:
- Upload cloud icon
- Microphone icon  
- Sentiment icons (check, x, minus circles)
- Chart/analytics icons for empty states

**Icon Treatment:** Consistent sizing (w-6 h-6 for inline, w-12 h-12 for prominent), stroke-width of 2