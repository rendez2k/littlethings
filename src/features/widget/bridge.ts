/**
 * The native widget bridge.
 *
 * Talks to the `LKWidget` Capacitor plugin provided by the native shell. In a
 * plain browser (or a shell without the plugin) the call rejects and is
 * swallowed, so this is safe to call unconditionally from the web app — the
 * widget simply doesn't update when there's nowhere to write to.
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import type { WidgetSnapshot } from './contract';

interface LKWidgetPlugin {
  /** Persist the snapshot to shared storage and refresh the widget timelines. */
  setSnapshot(options: { json: string }): Promise<void>;
}

const LKWidget = registerPlugin<LKWidgetPlugin>('LKWidget');

/** Whether the native LKWidget plugin is registered in this build. */
export function widgetsAvailable(): boolean {
  return Capacitor.isPluginAvailable('LKWidget');
}

/** Push a snapshot to the native widget. Non-fatal — never throws to callers. */
export async function pushWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  try {
    await LKWidget.setSnapshot({ json: JSON.stringify(snapshot) });
  } catch {
    // No native plugin (plain browser) or a transient failure — non-fatal.
  }
}

export type WidgetPushResult = 'sent' | 'unavailable' | 'error';

/** Push a snapshot and report the outcome — for the in-app widget diagnostic. */
export async function pushWidgetSnapshotResult(snapshot: WidgetSnapshot): Promise<WidgetPushResult> {
  if (!Capacitor.isPluginAvailable('LKWidget')) return 'unavailable';
  try {
    await LKWidget.setSnapshot({ json: JSON.stringify(snapshot) });
    return 'sent';
  } catch {
    return 'error';
  }
}
