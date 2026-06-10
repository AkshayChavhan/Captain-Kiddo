import { getActiveChildId } from "@/lib/activeChild";
import { TraceActivity } from "@/components/learning/TraceActivity";

/**
 * Alphabet tracing activity — /trace
 *
 * Reads the active child (for saving progress), then runs the letter-by-letter
 * tracing session. Server component so the child lookup happens on the server.
 */
export default async function TracePage() {
  const childId = await getActiveChildId();
  return <TraceActivity childId={childId} />;
}
