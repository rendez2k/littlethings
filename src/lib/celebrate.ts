import { completionHaptic } from './haptics';
import { confettiBurst } from './confetti';

/**
 * Celebrate a completion: a short haptic buzz (always) plus a confetti burst
 * from the tapped control (unless the user prefers reduced motion). Safe to call
 * anywhere; never throws.
 */
export function celebrateCompletion(el: Element | null, reducedMotion: boolean): void {
  completionHaptic();
  if (reducedMotion) return;
  const rect = el?.getBoundingClientRect();
  const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined;
  confettiBurst(origin);
}
