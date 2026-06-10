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
export interface ContentItem {
  label: string;
  emoji: string;
  count: number;
  /** The text spoken aloud (via browser TTS) when this item appears / is tapped. */
  speak: string;
}

/** Digit -> spoken word, so "3" reads as "three" (0–20 covers all tiers). */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

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
          speak: NUMBER_WORDS[n] ?? String(n), // "three", not "3"
        });
      }
      return items;
    }

    case "colors":
      return COLORS.map((c) => ({
        label: c.label,
        emoji: c.emoji,
        count: 1,
        speak: c.key, // "yellow"
      }));

    case "alphabets":
      return ALPHABET.map((a) => ({
        label: a.letter,
        emoji: a.emoji,
        count: 1,
        speak: a.letter, // "A"
      }));

    case "animals":
      return wordItems(ANIMALS);

    case "shapes":
      return wordItems(SHAPES);

    case "fruits":
      return wordItems(FRUITS);

    default:
      // Modules without bespoke content yet -> empty (LearningView shows a notice).
      return [];
  }
}

/** A word-based item: a name + an emoji. `key` is the spoken word. */
export interface WordEntry {
  key: string;
  label: string;
  emoji: string;
}

/** Map word entries to ContentItems that SPEAK their key on tap (e.g. "lion"). */
function wordItems(entries: WordEntry[]): ContentItem[] {
  return entries.map((e) => ({
    label: e.label,
    emoji: e.emoji,
    count: 1,
    speak: e.key,
  }));
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

/** Animals — tapping one speaks its name. */
export const ANIMALS: WordEntry[] = [
  { key: "lion", label: "Lion", emoji: "🦁" },
  { key: "dog", label: "Dog", emoji: "🐶" },
  { key: "cat", label: "Cat", emoji: "🐱" },
  { key: "elephant", label: "Elephant", emoji: "🐘" },
  { key: "monkey", label: "Monkey", emoji: "🐵" },
  { key: "cow", label: "Cow", emoji: "🐮" },
  { key: "frog", label: "Frog", emoji: "🐸" },
  { key: "penguin", label: "Penguin", emoji: "🐧" },
];

/** Shapes — tapping one speaks its name. */
export const SHAPES: WordEntry[] = [
  { key: "circle", label: "Circle", emoji: "🔵" },
  { key: "square", label: "Square", emoji: "🟦" },
  { key: "triangle", label: "Triangle", emoji: "🔺" },
  { key: "star", label: "Star", emoji: "⭐" },
  { key: "heart", label: "Heart", emoji: "❤️" },
  { key: "diamond", label: "Diamond", emoji: "🔶" },
];

/** Fruits — tapping one speaks its name. */
export const FRUITS: WordEntry[] = [
  { key: "apple", label: "Apple", emoji: "🍎" },
  { key: "banana", label: "Banana", emoji: "🍌" },
  { key: "grapes", label: "Grapes", emoji: "🍇" },
  { key: "orange", label: "Orange", emoji: "🍊" },
  { key: "strawberry", label: "Strawberry", emoji: "🍓" },
  { key: "watermelon", label: "Watermelon", emoji: "🍉" },
];
