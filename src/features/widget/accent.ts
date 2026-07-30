import { GARDEN_HEX } from '@/components/garden/mapping';
import type { WidgetColor } from './contract';

/**
 * The widget's ring accent. The garden has one signature accent — moss — and
 * the whole app now reads in that dusk palette regardless of the legacy accent
 * picker, so the home-screen ring uses moss to match. Safe to call outside
 * React (no storage or DOM access).
 */
export function currentWidgetAccent(): WidgetColor {
  return GARDEN_HEX.moss;
}
