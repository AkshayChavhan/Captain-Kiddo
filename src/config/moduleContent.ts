/**
 * Module content — what each learning module actually teaches.
 *
 * The Numbers module steps through numbers; Colors through colors; Alphabets
 * through letters. Rather than hard-code one game, each module supplies its
 * ITEMS here and LearningView renders them generically. Adding content to a
 * module = editing this file.
 *
 * An item has:
 *  - `label`: the big thing shown (e.g. "3", "Red", "A")
 *  - `emoji`: a visual aid (e.g. 🍎 for counting, 🔴 for red, 🍎 for "A is for apple")
 *  - `count`: how many emoji to show (numbers count out; colors/letters show 1)
 *  - `audio`: spoken clip path (audio-first)
 */
import { numberAudio, letterAudio } from "@/config/audio";

export interface ContentItem {
  label: string;
  emoji: string;
  count: number;
  audio: string;
}

/** Build the items for a tier of a module. Numbers use the tier's numeric range. */
export function getModuleItems(
  moduleSlug: string,
  range?: { from: number; to: number }
): ContentItem[] {
  switch (moduleSlug) {
    case "numbers": {
      const from = range?.from ?? 1;
      const to = range?.to ?? 5;
      const items: ContentItem[] = [];
      for (let n = from; n <= to; n++) {
        items.push({
          label: String(n),
          emoji: "🍎",
          count: n, // count out n apples
          audio: numberAudio(n),
        });
      }
      return items;
    }

    case "colors":
      return COLORS.map((c) => ({
        label: c.label,
        emoji: c.emoji,
        count: 1,
        audio: `/audio/colors/${c.key}.mp3`,
      }));

    case "alphabets":
      return ALPHABET.map((a) => ({
        label: a.letter,
        emoji: a.emoji,
        count: 1,
        audio: letterAudio(a.letter),
      }));

    default:
      // Modules without bespoke content yet -> empty (LearningView shows a notice).
      return [];
  }
}

/** Colors taught in the Colors module. `key` is used for audio paths. */
export const COLORS = [
  { key: "red", label: "Red", emoji: "🔴", hex: "#FF6B6B" },
  { key: "blue", label: "Blue", emoji: "🔵", hex: "#74B9FF" },
  { key: "green", label: "Green", emoji: "🟢", hex: "#00B894" },
  { key: "yellow", label: "Yellow", emoji: "🟡", hex: "#FFD93D" },
  { key: "purple", label: "Purple", emoji: "🟣", hex: "#6C5CE7" },
  { key: "orange", label: "Orange", emoji: "🟠", hex: "#E17055" },
];

/** A few letters with a "X is for ..." emoji (extend to A–Z over time). */
export const ALPHABET = [
  { letter: "A", emoji: "🍎" }, // Apple
  { letter: "B", emoji: "🐝" }, // Bee
  { letter: "C", emoji: "🐱" }, // Cat
  { letter: "D", emoji: "🐶" }, // Dog
  { letter: "E", emoji: "🐘" }, // Elephant
  { letter: "F", emoji: "🐟" }, // Fish
];
