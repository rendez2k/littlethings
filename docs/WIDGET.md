# Home-screen widget

A "Today" widget: overall progress ring (`completed / total`) plus a compact list
of today's habits with a done/partial marker. Always reflects **today**, whatever
day the app is showing.

## Architecture

Widgets are native — they can't be drawn in the WebView. The web app owns the
data; the native widget renders it. They meet over a Capacitor plugin and a
shared storage container.

```
Today screen ──useTodayWidgetSync──▶ pushWidgetSnapshot()
                                         │  (LKWidget Capacitor plugin)
                                         ▼
                            App Group / shared storage  ──read──▶ WidgetKit / Glance
                                         ▲                              │ tap toggles a habit
                       plugin also asks the OS to refresh timelines     ▼
   applyPendingWidgetToggles() ◀──drainPending()──  queued toggles (App Group)
      (on launch + every foreground; re-pushes the corrected snapshot)
```

- **`src/features/widget/contract.ts`** — the `WidgetSnapshot` JSON shape. The
  single source of truth; the native decoder must mirror it. Bump `schema` on any
  breaking change.
- **`snapshot.ts`** — pure `buildWidgetSnapshot(dayView, date, now)`.
- **`bridge.ts`** — `pushWidgetSnapshot()` and `drainPendingToggles()`; call the
  `LKWidget` plugin, no-op in a plain browser or a shell without the plugin (so
  it's safe to ship now).
- **`use-widget-sync.ts`** — pushes when today's content changes; only while the
  app is showing today.
- **`pending-toggles.ts`** — `applyPendingWidgetToggles()` writes widget-initiated
  toggles to the data layer; `pushTodayWidgetSnapshot()` re-pushes afterwards.
- **`widget-sync-bridge.tsx`** — mounted at the app root; drains + reconciles on
  launch and on every foreground.

## Two-way toggles

The widget is interactive: tapping a habit toggles today's completion. Because the
widget can't reach IndexedDB, the native side records the tap and the app applies
it later.

- Each queued toggle is `{ habitId, date, done }` where **`done` is the absolute
  desired state**, not a flip — so applying it is idempotent and re-applying a
  toggle that already landed is a no-op.
- `done: true` → mark today satisfied (`completion.complete`); `done: false` →
  clear today's completion (`completion.clear`).
- The app drains the queue on launch and every foreground, applies each toggle,
  then re-pushes today's snapshot so the widget self-corrects.

## The `LKWidget` Capacitor plugin (native, to build in the shell)

```ts
LKWidget.setSnapshot({ json: string }): Promise<void>
// Return and clear the queued toggles as a JSON array of { habitId, date, done }.
LKWidget.drainPending(): Promise<{ pending: string }>
```

Implementation per platform:

- **iOS (WidgetKit):** decode the JSON, write it to the App Group container
  (`group.<bundleId>`), then `WidgetCenter.shared.reloadAllTimelines()`. A Widget
  Extension target reads the same container in its `TimelineProvider` and renders
  a SwiftUI view (progress ring + rows). Needs the App Group entitlement on **both**
  the app and the extension, and a provisioning profile for the extension's own
  bundle id (`<bundleId>.widget`).
- **Android (Glance/AppWidget):** write to DataStore/SharedPreferences and trigger
  an `AppWidgetProvider` update.

## Status

- [x] Web contract, snapshot builder, bridge, sync hook (+ unit tests)
- [x] `LKWidget` native plugin (LaunchKit shell)
- [x] iOS Widget Extension target + App Group (injected at build time)
- [x] Signing: profiles for the extension bundle id (LaunchKit fastlane lanes)
- [ ] **Verify on a real build** — enable the `widgets` build option, do the
      one-time App Group setup, confirm it compiles, signs and renders on device
- [ ] Android Glance widget

The native iOS side lives in the LaunchKit shell repo (see its
`docs/ios-widget.md`). It's off by default; a build opts in via the `widgets`
option. Everything mechanical is verified; Swift compilation + signing only
confirm on a macOS build.
