import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createAuditLog, getClientInfo } from "@/lib/auditLog";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leftovers = await (prisma as any).leftOver.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            stock: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leftovers);
  } catch (error: any) {
    console.error("Error fetching leftovers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leftovers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, custodianName, custodianLocation, quantity } = body;

    if (!productId || !custodianName || !custodianLocation || !quantity) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const quantityNum = parseInt(quantity);
    if (quantityNum <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Get product to verify it exists
    const product = await (prisma as any).product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Create leftover without affecting product stock
    const result = await (prisma as any).leftOver.create({
      data: {
        productId,
        custodianName,
        custodianLocation,
        quantity: quantityNum,
      },
    });

    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "CREATE",
      entityType: "LEFTOVER",
      entityId: result.id,
      entityName: `${product.name} - ${custodianName}`,
      newData: result,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating leftover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create leftover" },
      { status: 500 }
    );
  }
}

