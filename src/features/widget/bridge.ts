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
  /**
   * Return and clear any completion toggles the user made from the widget while
   * the app was closed/backgrounded. Each is the *absolute* desired state, JSON
   * encoded, so applying it is idempotent.
   */
  drainPending(): Promise<{ pending: string }>;
}

const LKWidget = registerPlugin<LKWidgetPlugin>('LKWidget');

/** A completion toggle the user made from the home-screen widget. */
export interface PendingWidgetToggle {
  habitId: string;
  /** yyyy-mm-dd the toggle applies to. */
  date: string;
  /** Absolute target state: true → mark satisfied, false → clear. */
  done: boolean;
}

function isPendingToggle(value: unknown): value is PendingWidgetToggle {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return typeof t.habitId === 'string' && typeof t.date === 'string' && typeof t.done === 'boolean';
}

/**
 * Pull the queue of widget-initiated toggles from the native plugin, clearing it
 * on the native side. Safe on the web / plugin-less builds — resolves to `[]`.
 */
export async function drainPendingToggles(): Promise<PendingWidgetToggle[]> {
  try {
    const { pending } = await LKWidget.drainPending();
    const parsed: unknown = JSON.parse(pending || '[]');
    return Array.isArray(parsed) ? parsed.filter(isPendingToggle) : [];
  } catch {
    return [];
  }
}

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
