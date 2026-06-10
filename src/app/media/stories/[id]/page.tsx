import { notFound } from "next/navigation";
import { MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessMedia } from "@/lib/mediaAccess";
import { getActiveParentId } from "@/lib/activeParent";
import { MediaGate } from "@/components/media/MediaGate";
import { SleepStoryPlayer } from "@/components/media/SleepStoryPlayer";
import type { MediaItem } from "@/types/media";

/**
 * Sleep-story route — e.g. /media/stories/<id>
 *
 * Loads the story, checks free/paid access, and renders the gated narrated
 * SleepStoryPlayer. Server component.
 */
export default async function StoryPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  const content = await prisma.mediaContent.findUnique({
    where: { id: params.id },
  });

  if (!content || content.type !== MediaType.STORY) notFound();

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
      <SleepStoryPlayer item={item} />
    </MediaGate>
  );
}
