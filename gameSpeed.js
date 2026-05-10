// Source-of-truth drop speeds (milliseconds per row) keyed by level.
export const SPEEDS = {
  1: 1000,
  2: 800,
  3: 600,
  4: 400,
  5: 250,
};

// Keep level options fixed at 1..5.
export const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

export function currentSpeed(level) {
  return SPEEDS[level] ?? SPEEDS[1];
}

// Scheduler uses currentSpeed so runtime behavior matches UI labels.
export function scheduleDropStep({ level, onStep }) {
  return setInterval(onStep, currentSpeed(level));
}

// Labels derived from the same source of truth to avoid drift.
export function levelLabel(level) {
  const ms = currentSpeed(level);
  return `Level ${level} (${ms}ms/row)`;
}

export function levelOptionsWithLabels() {
  return LEVEL_OPTIONS.map((level) => ({
    value: level,
    label: levelLabel(level),
  }));
}
