/**
 * Audio path helpers.
 *
 * Central place that knows WHERE each audio clip lives in /public/audio. Keeping
 * these in one file means if we reorganize the audio folders, we change paths
 * here only — components just ask for "the sound for number 3".
 *
 * NOTE: the actual .mp3 files must be added under public/audio/... by you. Until
 * then the players simply stay silent (useSound is a safe no-op for missing
 * files won't crash the app, though the browser may log a load warning).
 */

/** Spoken number, e.g. numberAudio(3) -> "/audio/numbers/3.mp3". */
export function numberAudio(value: number): string {
  return `/audio/numbers/${value}.mp3`;
}

/** Spoken letter, e.g. letterAudio("A") -> "/audio/letters/a.mp3". */
export function letterAudio(letter: string): string {
  return `/audio/letters/${letter.toLowerCase()}.mp3`;
}

/**
 * Spoken NAME clip for a word-based module item (animals, shapes, fruits, colors).
 * e.g. nameAudio("animals", "lion") -> "/audio/animals/lion.mp3".
 * `key` should be a stable, lowercase, file-safe id.
 */
export function nameAudio(module: string, key: string): string {
  return `/audio/${module}/${key}.mp3`;
}

/** Encouraging feedback clips (used by quizzes/celebrations later). */
export const FEEDBACK_AUDIO = {
  correct: "/audio/feedback/great-job.mp3",
  wrong: "/audio/feedback/try-again.mp3",
} as const;
