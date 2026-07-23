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
                                         ▲
                       plugin also asks the OS to refresh timelines
```

- **`src/features/widget/contract.ts`** — the `WidgetSnapshot` JSON shape. The
  single source of truth; the native decoder must mirror it. Bump `schema` on any
  breaking change.
- **`snapshot.ts`** — pure `buildWidgetSnapshot(dayView, date, now)`.
- **`bridge.ts`** — `pushWidgetSnapshot()`; calls the `LKWidget` plugin, no-ops in
  a plain browser or a shell without the plugin (so it's safe to ship now).
- **`use-widget-sync.ts`** — pushes when today's content changes; only while the
  app is showing today.

## The `LKWidget` Capacitor plugin (native, to build in the shell)

```ts
LKWidget.setSnapshot({ json: string }): Promise<void>
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
- [ ] `LKWidget` native plugin (shell)
- [ ] iOS Widget Extension target + App Group
- [ ] Signing: provisioning for the extension bundle id (LaunchKit fastlane lanes)
- [ ] Android Glance widget
