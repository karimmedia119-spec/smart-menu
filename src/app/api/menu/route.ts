import { NextResponse } from "next/server";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "@/lib/data";
import { sanitizeInput } from "@/lib/security";
import { Product } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "tenant-first";

    const categories = INITIAL_CATEGORIES.filter((c) => c.tenantId === tenantId);
    const products = INITIAL_PRODUCTS.filter((p) => p.tenantId === tenantId);

    return NextResponse.json({
      success: true,
      categories,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "تعذر جلب بيانات القائمة." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = sanitizeInput(body.name || "");
    const description = sanitizeInput(body.description || "");
    const categoryId = sanitizeInput(body.categoryId || "");
    const price = Number(body.price) || 0;
    const tenantId = sanitizeInput(body.tenantId || "tenant-first");

    if (!name || !categoryId || price <= 0) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال اسم الصنف والتصنيف وسعر صحيح." },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      tenantId,
      name,
      description,
      price,
      categoryId,
      image:
        body.image ||
        body.imageUrl ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
      isAvailable: true,
      calories: Number(body.calories) || undefined,
      prepTimeMinutes: Number(body.prepTimeMinutes) || 12,
      modifiers: body.modifiers || [],
    };

    return NextResponse.json({
      success: true,
      message: "تمت إضافة الصنف الجديد بنجاح!",
      product: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "فشل في إضافة الصنف." },
      { status: 500 }
    );
  }
}
