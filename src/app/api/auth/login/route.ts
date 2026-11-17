import { NextResponse } from "next/server";
import { INITIAL_USERS } from "@/lib/data";
import {
  verifyPassword,
  createSessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  sanitizeInput,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeInput(body.email || "").toLowerCase().trim();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." },
        { status: 400 }
      );
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(email, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم قفل محاولات الدخول مؤقتاً لأسباب أمنية. يرجى المحاولة بعد ${Math.ceil(
            rateCheck.retryAfterSeconds / 60
          )} دقيقة.`,
          locked: true,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // Find user in system
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      const fail = recordFailedAttempt(email, 5);
      return NextResponse.json(
        {
          success: false,
          error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.",
          remainingAttempts: Math.max(0, 5 - fail.retryAfterSeconds),
        },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, error: "هذا الحساب موقوف من قبل الإدارة المركزية." },
        { status: 403 }
      );
    }

    // Verify password strictly against user's stored password/hash
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      const fail = recordFailedAttempt(email, 5);
      return NextResponse.json(
        {
          success: false,
          error: "كلمة المرور غير صحيحة.",
          remainingAttempts: Math.max(0, 5 - (fail.blocked ? 5 : 1)),
        },
        { status: 401 }
      );
    }

    // Reset rate limit on success
    resetRateLimit(email);

    // Generate tamper-proof session token
    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        phone: user.phone,
      },
      token,
    });

    // Set secure cookie
    response.cookies.set("smart_menu_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع في معالجة الطلب." },
      { status: 500 }
    );
  }
}
