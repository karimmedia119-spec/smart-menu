import { NextResponse } from "next/server";
import { sanitizeInput } from "@/lib/security";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedStatuses = ["pending", "preparing", "ready", "served", "completed", "cancelled"];
    const allowedPaymentStatuses = ["unpaid", "paid", "refunded"];

    const updates: Record<string, any> = {};

    if (body.status && allowedStatuses.includes(body.status)) {
      updates.status = body.status;
      if (body.status === "preparing") updates.prepStartedAt = new Date().toISOString();
      if (body.status === "ready") updates.readyAt = new Date().toISOString();
      if (body.status === "completed" || body.status === "served") updates.completedAt = new Date().toISOString();
    }

    if (body.paymentStatus && allowedPaymentStatuses.includes(body.paymentStatus)) {
      updates.paymentStatus = body.paymentStatus;
      if (body.paymentMethod) updates.paymentMethod = body.paymentMethod;
      if (body.paymentStatus === "paid") updates.paidAt = new Date().toISOString();
    }

    if (body.notes) {
      updates.notes = sanitizeInput(body.notes);
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة الطلب #${id} بنجاح`,
      orderId: id,
      updates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "فشل في تحديث حالة الطلب." },
      { status: 500 }
    );
  }
}
