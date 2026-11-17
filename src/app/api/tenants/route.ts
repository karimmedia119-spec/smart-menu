import { NextResponse } from "next/server";
import { INITIAL_TENANTS } from "@/lib/data";
import { sanitizeInput } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const tenant = INITIAL_TENANTS.find((t) => t.slug === slug);
      if (!tenant) {
        return NextResponse.json({ success: false, error: "المنشأة غير موجودة." }, { status: 404 });
      }
      return NextResponse.json({ success: true, tenant });
    }

    return NextResponse.json({
      success: true,
      tenants: INITIAL_TENANTS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "تعذر استرجاع بيانات المنشآت." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const tenantId = sanitizeInput(body.tenantId || "tenant-first");

    const updates: Record<string, any> = {};

    if (body.name) updates.name = sanitizeInput(body.name);
    if (body.stationLabel) updates.stationLabel = sanitizeInput(body.stationLabel);
    if (body.orderPointLabel) updates.orderPointLabel = sanitizeInput(body.orderPointLabel);
    if (body.branding) updates.branding = body.branding;
    if (body.planTier) updates.planTier = body.planTier;
    if (body.subscriptionStatus) updates.subscriptionStatus = body.subscriptionStatus;

    return NextResponse.json({
      success: true,
      message: "تم تحديث إعدادات المنشأة وترخيص الباقة بنجاح!",
      tenantId,
      updates,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "فشل في تحديث بيانات المنشأة." },
      { status: 500 }
    );
  }
}
