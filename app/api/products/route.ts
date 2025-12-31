import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createAuditLog, getClientInfo } from "@/lib/auditLog";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
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
    const { name, description, price, stock, category, location, type, images, colorVariants } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        location,
        type,
        images,
        colorVariants: colorVariants || [],
      },
    });

      // Create audit log
      const { ipAddress, userAgent } = getClientInfo(req);
      await createAuditLog({
        userId: session.user.id!,
        userName: session.user.name || undefined,
        userEmail: session.user.email || undefined,
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        entityName: product.name,
        newData: product,
        ipAddress,
        userAgent,
      });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
