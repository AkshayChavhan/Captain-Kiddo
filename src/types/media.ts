/**
 * Shared media view types.
 *
 * Plain TypeScript shapes the client components use, decoupled from Prisma's
 * generated types. A server component fetches a MediaContent row and maps it to
 * one of these before passing it to a client player.
 */

/** One karaoke lyric line + the time window it's active. Mirrors the Lyric type. */
export interface LyricLine {
  text: string;
  startSec: number;
  endSec: number;
}

/** The minimal song shape the sing-along player needs. */
export interface Song {
  id: string;
  title: string;
  audioUrl: string;
  coverImage?: string | null;
  lyrics: LyricLine[];
}
