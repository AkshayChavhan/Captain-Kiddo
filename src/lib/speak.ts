"use client";

/**
 * Text-to-speech using the browser's built-in Web Speech API (speechSynthesis).
 *
 * No audio files, no dependencies, no network — the device speaks the text out
 * loud. We feed it a "key"/word like "one", "yellow", "lion" and it reads it.
 *
 * Safe to call anywhere on the client: if the browser has no speech support it
 * simply does nothing (never throws).
 */

/** Speak `text` out loud. Cancels any in-progress speech first so taps don't stack. */
export function speak(text: string): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth || !text) return;

  // Stop anything currently speaking so a new tap interrupts cleanly.
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Kid-friendly: a touch slower and slightly higher pitch.
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.lang = "en-US";
  synth.speak(utterance);
}

/** Stop any speech immediately. */
export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
