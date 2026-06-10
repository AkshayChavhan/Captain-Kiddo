import { getActiveChildId } from "@/lib/activeChild";
import { NumberTraceActivity } from "@/components/learning/NumberTraceActivity";

/**
 * Number-writing (tracing) activity — /learn/numbers/write
 *
 * Kids trace the digits 0–9 to learn how to write them, reusing the shared trace
 * engine. Server component reads the active child for saving progress.
 */
export default async function NumberWritePage() {
  const childId = await getActiveChildId();
  return <NumberTraceActivity childId={childId} />;
}
