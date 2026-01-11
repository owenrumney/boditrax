# Boditrax Visualiser — Design Document

A client-side web app for visualising body composition data exported from the Boditrax mobile app.

## Overview

**Problem:** The Boditrax app provides basic data display but poor visualisation. Users tracking body composition changes (particularly those on GLP-1 medications like Mounjaro/Wegovy) want to see trends, understand what's happening beneath the headline weight number, and get actionable insights.

**Solution:** A simple, privacy-first web app that runs well on mobile devices where users upload their Boditrax CSV export and immediately see interactive charts and analysis. Everything runs client-side — no data leaves the browser.

---

## Core Features

### 1. CSV Upload & Parsing

- Drag-and-drop or file picker for CSV upload
- Parse the Boditrax export format (see Data Format section below)
- Validate the file structure and show clear errors if format is unexpected
- Store parsed data in memory only (never persisted, never sent anywhere)

### 2. Dashboard View

Display the following once data is loaded:

**Summary Cards**
- Current weight (most recent scan)
- Total weight change (first scan → latest)
- Current fat mass / muscle mass
- Visceral fat rating (with healthy threshold indicator)
- Metabolic age vs actual age

**Charts**
- **Weight Journey** — line chart with total weight, fat mass, muscle mass over time
  - Toggle: All time / Last 12 months / Last 3 months
- **Recent Trend** — zoomed view of last 8-12 weeks
- **Body Composition** — stacked or grouped bar showing fat vs muscle over time
- **Metabolic Age** — line chart with actual age reference line
- **Visceral Fat** — line chart with healthy threshold line (≤9 = healthy, 10-14 = elevated, 15+ = high)

### 3. Insights Panel

Rule-based analysis that detects patterns and displays relevant insights.

**Pattern Detection Rules:**

| Pattern | Detection Logic | Insight |
|---------|-----------------|---------|
| Weight plateau | <1kg change over 4+ weeks | "You're in a plateau phase. This is normal — check if fat is still decreasing even if weight is stable." |
| Rapid loss | >1kg/week average over 3+ weeks | "You're losing weight quickly. Monitor muscle mass to ensure you're preserving lean tissue." |
| Weight rebound | Weight increasing after a low point | "Weight is trending up from your recent low. Check the fat vs muscle breakdown — small increases are often water/glycogen, not fat." |
| Muscle loss | Muscle mass down >1kg while weight down | "You've lost some muscle mass alongside fat. Consider protein intake and resistance training." |
| Composition win | Weight stable but fat down, muscle up | "Great recomposition — you're losing fat and building muscle even though the scale hasn't moved." |
| Visceral fat drop | Visceral rating decreased by 2+ points | "Your visceral fat is dropping — this is one of the most important health markers." |
| Metabolic age improvement | Metabolic age decreased by 5+ years | "Your metabolic age has improved significantly — your body is getting healthier." |

**Implementation:** Run all pattern checks against the data on load. Display relevant insights in priority order (most significant first). Show 2-3 insights maximum to avoid overwhelming.

### 4. Optional AI Analysis (Discarded)

*Decision: Removed to prioritize privacy and user experience (users are unlikely to provide API keys).*


---

## Data Format

The Boditrax CSV export has this structure:

```
User Details
Email,FirstName LastName,DateOfBirth,Gender
user@example.com,First,Last,MM/DD/YYYY HH:MM:SS AM,Male

User Physique Details
Height,RecentClothesWeight
187,1

User Scan Details
BodyMetricTypeId,Value,CreatedDate
MuscleMass,71.9,1/5/2026 8:12:28 AM
FatMass,22.9,1/5/2026 8:12:28 AM
BodyWeight,98.5,1/5/2026 8:12:28 AM
...
```

An example is available in example_export.csv

**Parsing approach:**
1. Find "User Details" section → extract DOB (for age calculation)
2. Find "User Physique Details" section → extract height
3. Find "User Scan Details" section → parse all metric rows
4. Pivot data: group by CreatedDate, create object per scan with all metrics as properties
5. Sort chronologically

**Key metrics to extract:**
- `BodyWeight` — total weight in kg
- `FatMass` — fat in kg
- `MuscleMass` — muscle in kg
- `FatFreeMass` — lean mass in kg
- `VisceralFatRating` — 1-59 scale (≤9 healthy)
- `MetabolicAge` — estimated metabolic age
- `BodyMassIndex` — BMI
- `BoneMass` — bone mass in kg
- `WaterMass` — total body water in kg

---

## Tech Stack

```
/
├── index.html          # Single HTML file (or minimal multi-page)
├── css/
│   └── styles.css      # Styling (or Tailwind via CDN)
├── js/
│   ├── parser.js       # CSV parsing logic
│   ├── charts.js       # Chart.js configuration
│   ├── insights.js     # Rule-based analysis
│   ├── ai.js           # Optional AI integration
│   └── app.js          # Main app logic
└── README.md
```

**Dependencies (CDN):**
- Chart.js + date adapter
- Tailwind CSS (optional, via CDN)
- No build step required

**Alternatively:** Single HTML file with everything inlined (like the prototype) for maximum simplicity.

---

## UI/UX Notes

### Landing State (No Data)
- Clean hero with app name and one-line description
- Large drop zone: "Drop your Boditrax export here"
- Secondary file picker button
- Brief instructions: "Export your data from the Boditrax app → Settings → Export Data"
- Privacy note: "Your data never leaves your browser"

### Loaded State
- Summary cards at top
- Chart grid below
- Insights panel (sidebar on desktop, below charts on mobile)
- "Clear data" button to reset
- "Export as PDF" nice-to-have

### Mobile Considerations
- Charts should be swipeable or stacked vertically
- Summary cards in 2-column grid
- Touch-friendly date range toggles

### Dark Mode
- Default to dark (matches prototype aesthetic)
- Optional light mode toggle

---

## Privacy & Trust

This is critical for user adoption. Make it explicit:

1. **No backend** — static files only, host on GitHub Pages/Netlify/Vercel
2. **No analytics** — or if added, use privacy-respecting option (Plausible/Fathom)
3. **No data storage** — parsed data lives in memory, cleared on page refresh
4. **Source available** — GitHub repo linked in footer
5. **API key handling** — if AI feature used, key stored in localStorage only, transmitted directly to Anthropic

---

## Implementation Phases

### Phase 1: MVP (Weekend Project)
- [ ] CSV upload and parsing
- [ ] Summary cards
- [ ] Weight journey chart (single chart, time toggles)
- [ ] Basic responsive layout
- [ ] Deploy to GitHub Pages

### Phase 2: Full Dashboard
- [ ] All chart types from prototype
- [ ] Rule-based insights panel
- [ ] Improved mobile layout
- [ ] Dark/light mode toggle

### Phase 3: (Removed)

### Phase 4: Polish
- [ ] PDF export
- [ ] PWA support (installable, works offline)
- [ ] Shareable links (encode data in URL hash for sharing — optional, privacy tradeoff)

---

## Open Questions

1. **Branding** — Name? "Boditrax Visualiser" is descriptive but boring. Alternatives: "BodyGraph", "CompositionView", "ScanViz"?

2. **Scope creep** — Should this support other body composition formats (Withings, Renpho, etc.)? Probably not for v1, but architecture should allow adding parsers later.

3. **Monetisation** — Probably none, this is a side project. But if it gets traction: donations, or premium AI analysis tier?

4. **Legal** — "Boditrax" is trademarked. May need to use generic name and just mention compatibility.

---

## Reference

Prototype dashboard created during initial conversation demonstrates the target UX. Key learnings:
- Dark theme with accent colours per metric works well
- Time range toggles are essential for long datasets
- Composition breakdown (fat vs muscle) is more useful than weight alone
- Insight box with specific, personalised text adds value over raw charts
