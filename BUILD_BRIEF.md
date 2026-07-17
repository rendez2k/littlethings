# Habit Tracker PWA — Codex Build Brief

## 1. Project overview

Build a polished, mobile-first habit tracker Progressive Web App inspired by the clarity and usability of native iOS applications.

The product should feel:

* Simple to begin using
* Calm and visually refined
* Highly customisable without feeling complicated
* Fast and responsive
* Excellent in both light and dark mode
* Suitable for installation on an iPhone or Android home screen
* Fully usable without creating an account

The initial product is a focused personal habit tracker rather than a social platform.

Working product name: **Little Things**

Use this name as a placeholder and keep branding easy to replace later.

App should also have a list of items, a bucket list almost, of longer term projects and items they want to complete

---

# 2. Primary product principles

## Immediate value

A new user should be able to create their first habit in under 30 seconds.

Do not force registration, onboarding questionnaires or permissions before the user can begin.

## Progressive complexity

Show only the essential options during initial habit creation.

Place advanced settings behind a clearly labelled expandable section.

## Local first

The application must work without an account and without an internet connection after the first successful load.

Store data locally first. Cloud sync should be optional.

## Native-feeling interaction

The interface should feel closer to an iOS app than a traditional website.

Use:

* Bottom navigation
* Large, clear page titles
* Rounded cards
* Native-feeling sheets and menus
* Subtle transitions
* Tactile completion feedback
* Generous spacing
* Safe-area support
* Accessible touch targets

Do not imitate Apple branding or reproduce proprietary Apple interface assets exactly.

## Calm visual design

Avoid excessive gamification, confetti, loud gradients or dense dashboards.

Streaks and progress should motivate without making users feel punished for missing a day.

---

# 3. Technical stack

Use the following stack unless there is a compelling technical reason to change it.

## Application

* Next.js using the current stable App Router
* React
* TypeScript with strict mode enabled
* Tailwind CSS
* ESLint
* Prettier

## UI foundations

Use:

* Radix UI primitives or shadcn/ui where suitable
* Lucide icons
* CSS custom properties for design tokens
* Framer Motion only where animation materially improves the experience

Do not make the interface look like a default shadcn project. Components should be restyled to match the product design.

## Forms and validation

Use:

* React Hook Form
* Zod

## Local data

Use:

* IndexedDB
* Dexie as the IndexedDB wrapper

All core application functionality must work using local data only.

## Optional cloud services

Prepare the architecture for Supabase, but do not make Supabase mandatory for the first working release.

Supabase may later provide:

* Email authentication
* Magic-link authentication
* Cloud database
* Multi-device synchronisation
* Account deletion
* Data export

Create clean repository interfaces so local storage can later be complemented by cloud storage without rewriting the application.

## Testing

Use:

* Vitest
* React Testing Library
* Playwright for important user journeys

## Deployment

The finished application should deploy cleanly to Vercel.

Do not depend on long-running custom servers.

---

# 4. PWA requirements

Build this as a proper installable Progressive Web App.

Include:

* Web app manifest
* Application name and short name
* Theme colours
* Light and dark theme colours
* 192px and 512px application icons
* Maskable icon support
* Apple touch icon
* Standalone display mode
* Portrait-first orientation
* Service worker
* Offline application shell
* Offline access to habit data
* An offline fallback screen
* Appropriate caching strategy
* Safe-area inset handling
* Install guidance where appropriate

The app must remain functional when:

* The device loses connectivity
* The application is reopened while offline
* A habit is completed while offline
* A new habit is created while offline

Do not cache authenticated or personal API responses indiscriminately.

---

# 5. Browser and device targets

Prioritise:

1. Current iPhone Safari
2. Installed iOS PWA mode
3. Current Android Chrome
4. Installed Android PWA mode
5. Current desktop Safari, Chrome and Edge

The primary design width should be approximately 390px, but the interface must remain responsive.

On desktop, centre the application within a comfortable maximum-width layout rather than stretching mobile content across the screen.

---

# 6. Navigation structure

Use four main destinations in a persistent bottom navigation bar:

1. Today
2. Habits
3. Insights
4. Settings

The navigation should:

* Respect the mobile safe area
* Show both icon and label
* Clearly indicate the selected section
* Remain easy to reach with one thumb
* Avoid obscuring scrolling content

The primary add action should be accessible from Today and Habits.

---

# 7. Core screens

## 7.1 First launch

Show a minimal welcome state.

Content:

* App mark
* Short headline: “Build better days.”
* Supporting copy explaining that habits can be tracked privately without an account
* Primary action: “Create my first habit”
* Secondary action: “Use a template”

Do not create a multi-page onboarding carousel.

After a user creates or selects a habit, take them directly to Today.

Do not show the first-launch screen again once the user has created a habit.

---

## 7.2 Today

This is the main screen.

Header:

* Large “Today” title
* Current date
* Date strip for the current week
* Add button

Content:

* Habits scheduled for the selected day
* Completed habits remain visible
* Progress summary such as “3 of 5 complete”
* Optional compact progress ring
* Friendly empty state when no habits are scheduled

Each habit card should display:

* Habit icon
* Habit name
* Accent colour
* Optional short target label
* Current streak where relevant
* Completion control
* Optional note indicator

Completion behaviour:

* Tapping the completion control immediately updates the interface
* Provide restrained haptic-style visual feedback
* Allow completion to be undone
* Support multiple completions where the habit target requires a count
* Never use destructive confirmation for ordinary completion changes

Allow the user to move between nearby dates using the date strip.

Do not allow accidental editing when the user intends to complete a habit.

---

## 7.3 Habits

Show all active habits.

Include:

* Search when the list becomes long
* Active and archived sections
* Manual ordering
* Add habit action
* Clear summary of each habit’s schedule
* Long-press or overflow actions for edit, pause, archive and delete

Avoid exposing technical scheduling language.

Use human-readable labels such as:

* Every day
* Weekdays
* Mondays, Wednesdays and Fridays
* Three times per week
* Every two days

---

## 7.4 Create habit

Use a native-feeling full-screen sheet or page.

The simple setup area should include:

* Habit name
* Icon
* Colour
* Frequency
* Optional reminder
* Save button

Offer suggested icons based on the habit name, while allowing manual selection.

Include a palette of pastel colours:

* Lavender
* Sky
* Mint
* Sage
* Peach
* Coral
* Rose
* Lemon
* Aqua
* Slate

Each pastel should have accessible light-mode and dark-mode variants.

Advanced options should be collapsed initially.

Advanced options:

* Start date
* Optional end date
* Target type
* Target amount
* Unit
* Preferred time of day
* Notes
* Habit visibility
* Week start preference
* Allow skip
* Pause habit

The Save action should remain obvious and reachable.

Validate the form clearly without clearing entered data.

---

## 7.5 Habit templates

Provide templates grouped into categories:

* Health
* Movement
* Mindfulness
* Productivity
* Learning
* Home
* Personal care

Initial templates:

* Drink water
* Walk
* Exercise
* Read
* Meditate
* Take medication
* Journal
* Stretch
* Sleep routine
* No sugary drinks
* Practise a language
* Tidy for ten minutes

Selecting a template should pre-populate the create form rather than instantly creating the habit.

Users must be able to change every template value.

---

## 7.6 Habit details

Show:

* Habit title, icon and colour
* Current streak
* Best streak
* Completion rate
* Calendar heat map or monthly completion calendar
* Recent history
* Notes
* Edit action
* Pause or archive action

Users must be able to tap a historical date and correct its completion state.

Clearly distinguish:

* Completed
* Missed
* Skipped
* Not scheduled
* Future dates

Do not count future dates as missed.

---

## 7.7 Insights

Keep the first version useful and uncluttered.

Provide:

* Weekly, monthly and yearly range selector
* Overall completion percentage
* Total completions
* Current streak
* Best streak
* Perfect days
* Completion trend
* Habit-by-habit performance
* Most consistent day of the week

Charts must:

* Work in light and dark themes
* Use accessible labels
* Avoid relying solely on colour
* Include plain-language summaries

Avoid presenting misleading statistics when little data exists.

Show an encouraging low-data state during the first week.

---

## 7.8 Settings

Sections:

### Appearance

* Theme: System, Light or Dark
* App accent palette
* Reduced motion
* Compact or comfortable habit cards
* First day of week

### Habits

* Show streaks
* Show motivational messages
* Completion sound toggle
* Week start
* Default reminder behaviour

### Data

* Export data
* Import data
* Reset application
* Clear completed history
* Archived habits

### Account

Initially show:

* “Use without an account”
* Optional future sign-in area
* Explanation of cloud sync

### About

* Version
* Privacy
* Terms
* Feedback
* PWA installation help

Destructive actions must use clear confirmation dialogs.

---

# 8. Themes and visual system

## Theme modes

Support:

* System
* Light
* Dark

The system option must react to operating-system theme changes.

Persist the user’s selection.

Avoid a flash of the incorrect theme on startup.

## Pastel palettes

Provide global appearance palettes:

* Lavender
* Sky
* Mint
* Peach
* Rose
* Lemon

The global palette controls:

* Primary controls
* Selected navigation
* Focus rings
* Progress indicators
* Key highlights

Individual habit colours remain independently configurable.

## Light theme

Use:

* Warm off-white background
* White or subtly tinted cards
* Dark charcoal text
* Soft borders
* Restrained shadows

Avoid pure white across every surface.

## Dark theme

Use:

* Deep charcoal or blue-charcoal background
* Raised graphite surfaces
* Off-white primary text
* Muted secondary text
* Carefully adjusted pastel accents
* Borders rather than heavy shadows

Do not use pure black as the only dark background.

## Design tokens

Create semantic CSS variables for:

* Background
* Surface
* Elevated surface
* Text
* Muted text
* Border
* Primary
* Primary foreground
* Destructive
* Success
* Focus
* Habit accent colours
* Chart colours

Components must consume semantic tokens rather than hard-coded theme colours.

---

# 9. Typography and spacing

Use a system-first font stack suitable for Apple and non-Apple devices.

Suggested stack:

`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif`

Do not bundle proprietary Apple font files.

Use:

* Large page titles
* Clear section headings
* Comfortable body text
* Minimum 16px form text to avoid iOS input zoom
* Consistent 4px or 8px spacing system

Touch targets should generally be at least 44px by 44px.

---

# 10. Accessibility requirements

Target WCAG 2.2 AA where practical.

Include:

* Semantic HTML
* Keyboard operation
* Visible focus styles
* Screen-reader labels
* Accessible form errors
* Sufficient text contrast
* Sufficient non-text contrast
* Reduced-motion support
* No essential colour-only communication
* Appropriate heading hierarchy
* Accessible chart summaries
* Correct modal focus management

Pastel backgrounds must not be used behind white text unless contrast passes.

Run automated accessibility checks during development, but do not treat them as a substitute for manual review.

---

# 11. Habit scheduling model

Support these frequency types:

* Every day
* Selected weekdays
* A number of times per week
* A number of times per month
* Every N days
* One-off habit

Initial release does not need highly complex recurrence rules.

A habit should include:

* ID
* Name
* Description or notes
* Icon key
* Colour key
* Created date
* Start date
* Optional end date
* Schedule type
* Schedule configuration
* Target type
* Target value
* Unit
* Reminder configuration
* Sort order
* Active state
* Archived date
* Paused periods
* Created timestamp
* Updated timestamp

Completion records should be separate from habit definitions.

Each completion record should include:

* ID
* Habit ID
* Local calendar date
* Numeric value
* Completion state
* Optional note
* Created timestamp
* Updated timestamp

Store the user’s local calendar date explicitly.

Do not derive historic habit dates solely from UTC timestamps.

---

# 12. Target types

Support:

## Boolean

Examples:

* Meditated
* Took medication
* Made the bed

## Count

Examples:

* Eight glasses of water
* Ten thousand steps
* Twenty pages

## Duration

Examples:

* Meditate for ten minutes
* Exercise for thirty minutes

For the first release, duration entry can be a manual quantity. A timer is optional and should not delay the core build.

---

# 13. Streak rules

Implement streak calculations in a dedicated, well-tested utility module.

Requirements:

* Only scheduled dates count
* Future dates never count as missed
* Paused dates do not break a streak
* Approved skipped dates do not break a streak
* For “times per week” habits, streaks should operate on successful weeks rather than pretending the habit was scheduled on specific missed days
* Changes to historic completions should recalculate streaks
* Local date and timezone behaviour must be tested

Document the streak rules in the repository.

Avoid shame-oriented wording such as “You failed” or “Streak lost”.

---

# 14. Reminder strategy

Architect reminders behind a reminder service interface.

Possible implementations:

* Browser notifications
* Web push
* In-app reminder state

The application must continue functioning when notification permission is denied.

Do not request notification permission on first launch.

Ask only after the user creates a reminder and explain why the permission is needed.

Clearly communicate that PWA notification behaviour may vary by browser and operating system.

---

# 15. Local-first data architecture

Create repository abstractions such as:

* HabitRepository
* CompletionRepository
* SettingsRepository

Implement IndexedDB-backed repositories first.

UI components must not query Dexie directly.

Use a service layer for:

* Creating habits
* Editing habits
* Completing habits
* Calculating scheduled habits
* Calculating streaks
* Producing insights
* Importing and exporting data

This separation should make a later Supabase adapter possible.

All local mutations should update the UI optimistically.

---

# 16. Optional account and sync architecture

Do not make sign-in part of the initial critical path.

Prepare for a future sync model with:

* Stable UUIDs generated locally
* Updated timestamps
* Soft deletion or tombstones
* Per-record conflict resolution
* Last successful sync timestamp
* Clear offline mutation queue

Do not implement complex cloud synchronisation until the local application is stable and tested.

When sync is eventually implemented:

* A local user must be able to attach existing data to a new account
* Logging out must not silently destroy local data
* Duplicate data must be avoided
* Account deletion must be supported
* Sync errors must not block local use

---

# 17. Data export and import

Support JSON export in the first release.

Export should contain:

* Schema version
* Export timestamp
* Settings
* Habits
* Completion records

Import should:

* Validate with Zod
* Reject unsupported or malformed files safely
* Offer merge or replace behaviour
* Create a backup before replacement
* Report how many records were imported

Design the schema so CSV export can be added later.

---

# 18. Suggested project structure

Use a clear feature-oriented structure similar to:

```text
src/
  app/
    page.tsx
    today/
    habits/
    insights/
    settings/
  components/
    ui/
    navigation/
    habits/
    charts/
    forms/
  features/
    habits/
      components/
      services/
      repositories/
      schemas/
      types/
    completions/
    insights/
    reminders/
    settings/
  db/
    dexie.ts
    migrations/
  lib/
    dates/
    pwa/
    accessibility/
    validation/
  styles/
  tests/
public/
  icons/
  manifest.webmanifest
```

Adjust this structure where necessary, but maintain separation between UI, domain logic and persistence.

---

# 19. State management

Prefer:

* Server components only where they provide a real benefit
* Client components for interactive local-first screens
* React context for small global concerns such as theme
* TanStack Query only where asynchronous cache management adds value
* Zustand only if shared client state becomes genuinely complex

Do not add Redux.

Do not duplicate IndexedDB data unnecessarily into a large global store.

---

# 20. Date handling

Use a reliable date library such as date-fns.

Create utilities for:

* Local date keys
* Week boundaries
* Month boundaries
* Schedule matching
* Timezone-safe comparisons
* User-selected week starts

Do not scatter date calculations throughout components.

Test:

* Daylight-saving changes
* Month boundaries
* Year boundaries
* Leap years
* Sunday and Monday week starts
* Users travelling between timezones

---

# 21. Empty, loading and error states

Every primary screen must have intentional states for:

* No data
* Loading
* Recoverable error
* Offline
* Partial data
* Permission denied

Messages should be friendly and actionable.

Examples:

* “Nothing planned for today.”
* “Your habits are saved on this device.”
* “You’re offline, but you can keep tracking.”
* “Notifications are off. You can enable them in Settings.”

Avoid generic messages such as “Something went wrong” without useful next steps.

---

# 22. Motion and feedback

Use subtle motion for:

* Completing a habit
* Opening sheets
* Reordering habits
* Switching date ranges
* Changing themes

Respect `prefers-reduced-motion`.

Do not animate every card on every page load.

Do not use large celebratory animations for ordinary completions.

A small completion pulse, check transition or progress-ring update is sufficient.

---

# 23. Performance requirements

Target:

* Fast first load
* Smooth interaction on mid-range mobile devices
* Minimal JavaScript where possible
* Lazy-loaded charts
* No unnecessary re-rendering of the full habit list
* Optimised icons and images
* No blocking third-party analytics in the initial release

Run Lighthouse against a production build.

Aim for strong scores in:

* Performance
* Accessibility
* Best practices
* PWA readiness

Do not manipulate the implementation merely to chase a score at the expense of usability.

---

# 24. Privacy and security

The local-first version should not transmit habit data externally.

Do not add analytics by default.

Do not include advertising trackers.

Use secure coding practices for:

* Imported files
* Future authentication
* User-generated notes
* Database queries
* Environment variables

Never expose service-role keys or secrets in the client bundle.

Include a plain-language privacy page that accurately describes the implemented behaviour.

---

# 25. Testing requirements

## Unit tests

Cover:

* Schedule matching
* Streak calculation
* Completion percentages
* Date-key handling
* Paused periods
* Skipped dates
* Import validation
* Theme persistence

## Component tests

Cover:

* Creating a habit
* Editing a habit
* Completing and uncompleting a habit
* Theme selection
* Validation errors
* Empty states

## End-to-end tests

Cover these primary journeys:

1. First launch to first completed habit
2. Create a custom daily habit
3. Create a selected-weekday habit
4. Complete and undo a habit
5. Edit a habit
6. Change to dark mode
7. Change pastel palette
8. Navigate while offline
9. Export and re-import data
10. Archive and restore a habit

Tests should run using deterministic dates.

---

# 26. Required initial seed data

Development mode may provide an optional demo-data action.

Demo habits:

* Drink water — daily — sky
* Meditate — daily — lavender
* Exercise — Monday, Wednesday and Friday — mint
* Read a book — daily — peach
* No sugary drinks — daily — rose

Do not silently add demo habits for real users.

---

# 27. Definition of done for version one

Version one is complete when:

* The PWA can be installed
* The application works offline
* Users can use it without an account
* Users can create, edit, pause, archive and delete habits
* Users can complete habits for today and historical dates
* Daily, weekday and flexible weekly schedules work
* Streaks calculate correctly
* Today, Habits, Insights and Settings are implemented
* Light, dark and system themes work
* Pastel palettes work
* Data survives browser restarts
* JSON export and import work
* Major user journeys have automated tests
* The production build passes
* ESLint and type checking pass
* No serious accessibility issues remain
* The app deploys successfully to Vercel
* The README explains local development and deployment

---

# 28. Implementation phases

Work in the following order.

## Phase 1 — Foundation

* Scaffold the Next.js TypeScript project
* Configure Tailwind
* Configure linting and formatting
* Establish design tokens
* Add light, dark and system themes
* Add pastel palette switching
* Create the mobile application shell
* Create bottom navigation
* Add the PWA manifest and placeholder icons
* Add a basic service worker
* Add the initial test setup

Deliver a working application shell before continuing.

## Phase 2 — Domain and local database

* Define Zod schemas and TypeScript types
* Create Dexie database
* Implement repositories
* Implement local date utilities
* Implement schedule matching
* Implement completion logic
* Implement streak calculations
* Add unit tests

Do not build advanced screens until this logic is tested.

## Phase 3 — Habit creation

* Build first-launch state
* Build template selection
* Build simple habit creation
* Build advanced options
* Build edit flow
* Persist habits locally
* Add form and component tests

## Phase 4 — Daily tracking

* Build Today
* Add date strip
* Add completion interactions
* Add count and duration targets
* Add historical completion editing
* Add optimistic updates
* Add offline messaging

## Phase 5 — Organisation

* Build Habits
* Add ordering
* Add pause
* Add archive
* Add restore
* Add deletion confirmation
* Build habit details

## Phase 6 — Insights

* Add statistics service
* Add range selection
* Add summary metrics
* Add accessible charts
* Add low-data states
* Verify dark-mode chart styling

## Phase 7 — Settings and portability

* Complete appearance settings
* Add JSON export
* Add JSON import
* Add reset and history-clearing flows
* Add privacy and installation pages

## Phase 8 — PWA hardening

* Verify offline flows
* Verify installed mode
* Add final application icons
* Review caching
* Review safe-area behaviour
* Test iOS Safari
* Test Android Chrome
* Run Lighthouse

## Phase 9 — Quality pass

* Complete Playwright journeys
* Fix accessibility issues
* Fix type and lint errors
* Review performance
* Review empty and error states
* Update documentation
* Produce deployment instructions

---

# 29. Codex working instructions

Before changing code:

1. Read this entire brief.
2. Inspect the repository.
3. Summarise the current implementation.
4. Identify which implementation phase is active.
5. Produce a concise plan.
6. State any assumptions.
7. Then implement the phase.

While working:

* Make changes directly rather than only describing them
* Keep each change focused
* Run relevant tests
* Run type checking
* Run linting
* Inspect failures rather than bypassing them
* Do not replace working architecture without a clear reason
* Avoid unnecessary dependencies
* Do not leave major features as non-functional mock buttons
* Add TODO comments only for genuinely deferred work
* Keep the application runnable after each phase
* Update the README when setup changes
* Record important architectural decisions

At the end of each phase, report:

* What was implemented
* Files added or changed
* Tests run
* Results
* Known limitations
* Recommended next phase

Do not claim a feature works unless it has been run or tested.

---

# 30. First Codex task

Begin with Phase 1 only.

Create the initial project foundation and application shell.

The first deliverable must include:

* A functioning Next.js application
* TypeScript strict mode
* Tailwind configuration
* Responsive mobile shell
* Today, Habits, Insights and Settings placeholder routes
* Bottom navigation
* System, light and dark theme support
* Lavender, sky, mint, peach, rose and lemon palette options
* Persisted appearance settings
* PWA manifest
* Placeholder PWA icons
* Basic offline shell
* Vitest configuration
* Playwright configuration
* ESLint and formatting
* A clear README

Create a restrained iOS-inspired interface using semantic design tokens.

Do not implement the database or complete habit functionality during this first task.

Run:

* Type checking
* Linting
* Unit tests
* Production build

Resolve failures before concluding.

After completing Phase 1, stop and provide a structured implementation report. Do not begin Phase 2 automatically.
