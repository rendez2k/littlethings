/**
 * The native widget bridge.
 *
 * Talks to the `LKWidget` Capacitor plugin provided by the native shell. In a
 * plain browser (or a shell without the plugin) it no-ops, so this is safe to
 * call unconditionally from the web app — the widget simply doesn't update when
 * there's nowhere to write to.
 */

import type { WidgetSnapshot } from './contract';

interface LKWidgetPlugin {
  /** Persist the snapshot to shared storage and refresh the widget timelines. */
  setSnapshot(options: { json: string }): Promise<void>;
}

function getPlugin(): LKWidgetPlugin | null {
  const cap = (globalThis as unknown as {
    Capacitor?: { Plugins?: Record<string, unknown> };
  }).Capacitor;
  const plugin = cap?.Plugins?.LKWidget as LKWidgetPlugin | undefined;
  return plugin && typeof plugin.setSnapshot === 'function' ? plugin : null;
}

/** Whether a native widget bridge is present (i.e. running inside the shell). */
export function widgetsAvailable(): boolean {
  return getPlugin() !== null;
}

/** Push a snapshot to the native widget. Non-fatal — never throws to callers. */
export async function pushWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  const plugin = getPlugin();
  if (!plugin) return;
  try {
    await plugin.setSnapshot({ json: JSON.stringify(snapshot) });
  } catch {
    // A widget refresh failing must never disrupt the app.
  }
}
