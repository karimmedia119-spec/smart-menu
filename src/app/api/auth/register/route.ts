import { NextResponse } from "next/server";
import { hashPassword, createSessionToken, sanitizeInput } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const businessName = sanitizeInput(body.businessName || "");
    const ownerName = sanitizeInput(body.ownerName || "");
    const email = sanitizeInput(body.email || "").toLowerCase().trim();
    const password = (body.password || "").trim();
    const phone = sanitizeInput(body.phone || "");
    const businessType = body.businessType || "restaurant";

    if (!businessName || !ownerName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "يرجى ملء جميع الحقول الإلزامية." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." },
        { status: 400 }
      );
    }

    // Generate unique slug
    const slug =
      businessName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-") || `tenant-${Date.now()}`;

    const tenantId = `tenant-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    const hashedPassword = await hashPassword(password);

    // Create Tenant Object (7-day trial)
    const newTenant = {
      id: tenantId,
      name: businessName,
      slug,
      businessType,
      stationLabel: businessType === "cafe" ? "البار وقسم القهوة" : "المطبخ الرئيسي",
      orderPointLabel: businessType === "cafe" ? "شباك استلام" : "طاولة",
      branding: {
        primaryColor: "#D97706",
        themeMode: "warm",
        fontFamily: "Cairo",
        currency: "ج.م",
        taxPercentage: 14,
        serviceFeePercentage: 0,
        logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=160&auto=format&fit=crop&q=80",
      },
      planTier: "pro",
      planStatus: "active",
      subscriptionStatus: "trial",
      subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ownerName,
      ownerPhone: phone || "01000000000",
      onboardingCompleted: false,
    };

    const newUser = {
      id: userId,
      name: ownerName,
      email,
      role: "TENANT_ADMIN",
      tenantId,
      phone,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const token = await createSessionToken({
      userId,
      role: "TENANT_ADMIN",
      tenantId,
    });

    const response = NextResponse.json({
      success: true,
      message: "تم إنشاء حساب المنشأة وتفعيل باقة التجربة المجانية 7 أيام بنجاح!",
      tenant: newTenant,
      user: newUser,
      token,
    });

    response.cookies.set("smart_menu_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "فشل في تسجيل المنشأة الجديدة." },
      { status: 500 }
    );
  }
}
