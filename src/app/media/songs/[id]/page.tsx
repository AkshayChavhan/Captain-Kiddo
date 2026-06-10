import { notFound } from "next/navigation";
import { MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessMedia } from "@/lib/mediaAccess";
import { getActiveParentId } from "@/lib/activeParent";
import { MediaGate } from "@/components/media/MediaGate";
import { SingAlongPlayer } from "@/components/media/SingAlongPlayer";
import type { Song } from "@/types/media";

/**
 * Sing-along song route — e.g. /media/songs/<id>
 *
 * Loads the song, checks free/paid access for the active parent, and renders the
 * gated SingAlongPlayer. Server component so we fetch + gate before any audio
 * loads on the client.
 */
export default async function SongPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const content = await prisma.mediaContent.findUnique({
    where: { id: params.id },
  });

  // Must exist and actually be a SONG.
  if (!content || content.type !== MediaType.SONG) notFound();

  // Map the Prisma row to the plain Song shape the client player uses.
  const song: Song = {
    id: content.id,
    title: content.title,
    audioUrl: content.audioUrl,
    coverImage: content.coverImage,
    lyrics: content.lyrics.map((l) => ({
      text: l.text,
      startSec: l.startSec,
      endSec: l.endSec,
    })),
  };

  // Free/paid gating (per-parent). No active parent yet -> treat as locked unless
  // the song is free, so paid content never leaks.
  const parentId = await getActiveParentId();
  const canPlay = content.isFree
    ? true
    : parentId
      ? await canAccessMedia(parentId, { id: content.id, isFree: content.isFree })
      : false;

  return (
    <MediaGate
      locked={!canPlay}
      priceInPaise={content.priceInPaise}
      title={content.title}
    >
      <SingAlongPlayer song={song} />
    </MediaGate>
  );
}
