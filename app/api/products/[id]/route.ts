import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createAuditLog, getChanges, getClientInfo } from "@/lib/auditLog";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, productNumber, description, price, stock, category, location, type, images, colorVariants } = body;

    // Get old data before update
    const oldProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!oldProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        productNumber: productNumber as string,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        location,
        type,
        images,
        colorVariants: colorVariants || [],
      } as any,
    });


    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "UPDATE",
      entityType: "PRODUCT",
      entityId: product.id,
      entityName: product.name,
      oldData: oldProduct,
      newData: product,
      changes: getChanges(oldProduct, product),
      ipAddress,
      userAgent,
    });


    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get product data before deletion
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "DELETE",
      entityType: "PRODUCT",
      entityId: id,
      entityName: product.name,
      oldData: product,
      ipAddress,
      userAgent,
    });


    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

