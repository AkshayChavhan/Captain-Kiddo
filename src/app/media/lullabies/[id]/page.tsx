import { notFound } from "next/navigation";
import { MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessMedia } from "@/lib/mediaAccess";
import { getActiveParentId } from "@/lib/activeParent";
import { MediaGate } from "@/components/media/MediaGate";
import { LullabyPlayer } from "@/components/media/LullabyPlayer";
import type { MediaItem } from "@/types/media";

/**
 * Lullaby route — e.g. /media/lullabies/<id>
 *
 * Loads the lullaby, checks free/paid access, and renders the gated, calming
 * LullabyPlayer (with its sleep timer). Server component.
 */
export default async function LullabyPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const content = await prisma.mediaContent.findUnique({
    where: { id: params.id },
  });

  if (!content || content.type !== MediaType.LULLABY) notFound();

  const item: MediaItem = {
    id: content.id,
    title: content.title,
    audioUrl: content.audioUrl,
    coverImage: content.coverImage,
  };

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
      <LullabyPlayer item={item} />
    </MediaGate>
  );
}
