import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Mark a payment PAID and grant the corresponding access — ATOMICALLY.
 *
 * Called only AFTER the Razorpay signature is verified server-side. Everything
 * runs in one transaction so a payment can never be marked PAID without its
 * access row being created (or vice versa).
 *
 * Idempotent: if the payment is already PAID (e.g. a duplicate verify call), we
 * don't double-create access. The ModuleAccess @@unique([parentId, module])
 * constraint is the final backstop.
 */
export async function markPaidAndGrant(razorpayOrderId: string, params: {
  paymentId: string;
  signature: string;
}): Promise<{ ok: boolean; error?: string }> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) return { ok: false, error: "Unknown order." };

    // Already processed -> succeed without doing it again (idempotent).
    if (payment.status === "PAID") return { ok: true };

    // Flip to PAID and store the verified payment id + signature.
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId: params.paymentId,
        razorpaySignature: params.signature,
      },
    });

    // Grant access for what was bought (payment.module is a slug or "ALL").
    // upsert so a retried/duplicate grant doesn't violate the unique constraint.
    await tx.moduleAccess.upsert({
      where: {
        parentId_module: { parentId: payment.parentId, module: payment.module },
      },
      create: {
        parentId: payment.parentId,
        module: payment.module,
        paymentId: payment.id,
      },
      update: {}, // already granted -> nothing to change
    });

    return { ok: true };
  });
}
