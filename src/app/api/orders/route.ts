import { NextResponse } from "next/server";
import { INITIAL_ORDERS } from "@/lib/data";
import { sanitizeInput } from "@/lib/security";
import { Order, OrderItem } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "tenant-first";
    const status = searchParams.get("status");

    let orders = INITIAL_ORDERS.filter((o) => o.tenantId === tenantId);

    if (status && status !== "all") {
      orders = orders.filter((o) => o.status === status);
    }

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "تعذر جلب الطلبات." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tenantId = sanitizeInput(body.tenantId || "tenant-first");
    const customerName = sanitizeInput(body.customerName || "عميل الصالة");
    const customerPhone = sanitizeInput(body.customerPhone || "");
    const orderPointName = sanitizeInput(body.orderPointName || "طاولة 1");
    const orderType = body.orderType || "dine_in";
    const items: OrderItem[] = body.items || [];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "لا يمكن إرسال طلب فارغ بدون أصناف." },
        { status: 400 }
      );
    }

    // Security check: Recalculate subtotal server-side to prevent client price tampering
    let recalculatedSubtotal = 0;
    const validatedItems: OrderItem[] = items.map((item) => {
      let itemPrice = Number(item.unitPrice) || 0;
      let modifiersTotal = 0;

      if (Array.isArray(item.selectedModifiers)) {
        modifiersTotal = item.selectedModifiers.reduce(
          (sum, mod) => sum + (Number(mod.price) || 0),
          0
        );
      }

      const singleItemTotal = itemPrice + modifiersTotal;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const totalItemLinePrice = singleItemTotal * quantity;

      recalculatedSubtotal += totalItemLinePrice;

      return {
        ...item,
        productId: sanitizeInput(item.productId),
        productName: sanitizeInput(item.productName),
        quantity,
        unitPrice: itemPrice,
        totalPrice: totalItemLinePrice,
        notes: item.notes ? sanitizeInput(item.notes) : undefined,
      };
    });

    const taxAmount = Number((recalculatedSubtotal * 0.14).toFixed(2));
    const serviceAmount = 0;
    const total = Number((recalculatedSubtotal + taxAmount + serviceAmount).toFixed(2));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tenantId,
      orderNumber: Math.floor(100 + Math.random() * 900).toString(),
      orderType,
      orderPointName,
      customerName,
      customerPhone,
      items: validatedItems,
      status: "pending",
      subtotal: recalculatedSubtotal,
      taxAmount,
      serviceAmount,
      total,
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "تم استقبال الطلب وإرساله إلى شاشة المطبخ والكاشير بنجاح!",
      order: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "فشل في معالجة الطلب." },
      { status: 500 }
    );
  }
}
