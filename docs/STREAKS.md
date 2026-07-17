# Streak rules

Streaks are calculated in one place — `src/features/streaks/streak.ts` — and
covered by unit tests. This document is the source of truth for the intended
behaviour (brief §13).

## Principles

- **Only scheduled dates count.** Days the habit isn't scheduled are ignored.
- **Future never counts as missed.** Today and future days can't break a streak.
- **Paused days don't break a streak.** They bridge it (neutral — they neither
  extend nor reset the run).
- **Skipped days don't break a streak.** A skip is also a neutral bridge.
- **Missing a scheduled past day breaks the streak.** So does a past day left
  only partially complete (target not met).
- **Today is never "missed".** A scheduled-but-not-yet-done today is neutral, so
  the streak reflects your history up to yesterday until you complete today.
- **Editing history recalculates.** Streaks are derived from records, not stored,
  so correcting a past day immediately changes the result.

## How each schedule type is measured

| Schedule                                      | Unit      | A period "succeeds" when…      |
| --------------------------------------------- | --------- | ------------------------------ |
| Every day / Weekdays / Every N days / One-off | **day**   | that scheduled day is complete |
| N times per week                              | **week**  | ≥ N completions that week      |
| N times per month                             | **month** | ≥ N completions that month     |

For flexible (per-week / per-month) habits we count **successful periods**, not
individual days — we never pretend the habit was scheduled on a specific missed
day. The current in-progress period is neutral until it reaches its target.

To avoid penalising a partial first/last period, the requirement is prorated to
the number of available (in-range, non-paused) days in that period:
`required = min(N, availableDays)`.

## Results

`computeStreak` returns `{ current, best, unit }`:

- **current** — length of the run ending at the most recent scheduled
  day/period, with today (or the current period) treated as neutral if not yet
  done.
- **best** — the longest run ever, with neutral days/periods bridging.
- **unit** — `'day' | 'week' | 'month'`, so the UI can say "12 day streak" or
  "3 week streak".

## Wording

No shame language. The UI never says "You failed" or "Streak lost" (brief §13).
