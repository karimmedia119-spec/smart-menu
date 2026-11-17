import { NextResponse } from "next/server";
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "tenant-first";

    const tenantOrders = INITIAL_ORDERS.filter((o) => o.tenantId === tenantId);
    const paidOrders = tenantOrders.filter((o) => o.paymentStatus === "paid");

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTax = paidOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
    const averageOrderValue = paidOrders.length > 0 ? Number((totalRevenue / paidOrders.length).toFixed(2)) : 0;

    // Payment methods breakdown
    const paymentMethods = {
      cash: paidOrders.filter((o) => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0),
      card: paidOrders.filter((o) => o.paymentMethod === "card").reduce((s, o) => s + o.total, 0),
      instapay: paidOrders.filter((o) => o.paymentMethod === "instapay").reduce((s, o) => s + o.total, 0),
      vodafone_cash: paidOrders.filter((o) => o.paymentMethod === "vodafone_cash").reduce((s, o) => s + o.total, 0),
    };

    // Orders status breakdown
    const statusCounts = {
      pending: tenantOrders.filter((o) => o.status === "pending").length,
      preparing: tenantOrders.filter((o) => o.status === "preparing").length,
      ready: tenantOrders.filter((o) => o.status === "ready").length,
      completed: tenantOrders.filter((o) => o.status === "completed").length,
    };

    // Top selling items
    const productFrequency: Record<string, { name: string; count: number; totalSales: number }> = {};
    tenantOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productFrequency[item.productId]) {
          productFrequency[item.productId] = {
            name: item.productName,
            count: 0,
            totalSales: 0,
          };
        }
        productFrequency[item.productId].count += item.quantity;
        productFrequency[item.productId].totalSales += item.totalPrice;
      });
    });

    const topSellingProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      tenantId,
      summary: {
        totalOrders: tenantOrders.length,
        paidOrdersCount: paidOrders.length,
        totalRevenue,
        totalTax,
        averageOrderValue,
      },
      statusCounts,
      paymentMethods,
      topSellingProducts,
      kdsMetrics: {
        averagePrepTimeMinutes: 14.5,
        onTimeRatePercentage: 92,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "تعذر احتساب التحليلات المالية." },
      { status: 500 }
    );
  }
}
