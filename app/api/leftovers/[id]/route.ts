import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { createAuditLog, getChanges, getClientInfo } from "@/lib/auditLog";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const leftover = await (prisma as any).leftOver.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!leftover) {
      return NextResponse.json({ error: "Leftover not found" }, { status: 404 });
    }

    return NextResponse.json(leftover);
  } catch (error: any) {
    console.error("Error fetching leftover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leftover" },
      { status: 500 }
    );
  }
}

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
    // Get old leftover data before update (for audit log)
    const oldLeftover = await (prisma as any).leftOver.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!oldLeftover) {
      return NextResponse.json(
        { error: "Leftover not found" },
        { status: 404 }
      );
    }
    // Get existing leftover and product
    // const existingLeftover = await (prisma as any).leftOver.findUnique({
    //   where: { id },
    //   include: { product: true },
    // });

    // if (!existingLeftover) {
    //   return NextResponse.json(
    //     { error: "Leftover not found" },
    //     { status: 404 }
    //   );
    // }

    // Get current product (might be different if productId changed)
    const product = await (prisma as any).product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate stock adjustment
    // const quantityDifference = quantityNum - existingLeftover.quantity;
    // const availableStock = product.stock + (existingLeftover.productId === productId ? existingLeftover.quantity : 0);

    // if (quantityNum > availableStock) {
    //   return NextResponse.json(
    //     { error: `Quantity cannot exceed available stock (${availableStock})` },
    //     { status: 400 }
    //   );
    // }

    // Update leftover and adjust product stock in a transaction
    // const result = await prisma.$transaction(async (tx) => {
    //   // If product changed, restore stock to old product and deduct from new product
    //   if (existingLeftover.productId !== productId) {
    //     await tx.product.update({
    //       where: { id: existingLeftover.productId },
    //       data: {
    //         stock: {
    //           increment: existingLeftover.quantity,
    //         },
    //       },
    //     });

    //     await tx.product.update({
    //       where: { id: productId },
    //       data: {
    //         stock: {
    //           decrement: quantityNum,
    //         },
    //       },
    //     });
    //   } else {
    //     // Same product, adjust by difference
    //     await tx.product.update({
    //       where: { id: productId },
    //       data: {
    //         stock: {
    //           decrement: quantityDifference,
    //         },
    //       },
    //     });
    //   }

    //   const leftover = await (tx as any).leftOver.update({
    //     where: { id },
    //     data: {
    //       productId,
    //       custodianName,
    //       custodianLocation,
    //       quantity: quantityNum,
    //     },
    //   });

    //   return leftover;
    // });

    const result = await (prisma as any).leftOver.update({
      where: { id },
      data: {
        productId,
        custodianName,
        custodianLocation,
        quantity: quantityNum,
      },
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update leftover" },
        { status: 500 }
      );
    }


    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "UPDATE",
      entityType: "LEFTOVER",
      entityId: result.id,
      entityName: `${product.name} - ${custodianName}`,
      oldData: oldLeftover,
      newData: result,
      changes: getChanges(oldLeftover, result),
      ipAddress,
      userAgent,
    });


    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating leftover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update leftover" },
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

    // Get leftover to verify it exists
    const leftover = await (prisma as any).leftOver.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!leftover) {
      return NextResponse.json(
        { error: "Leftover not found" },
        { status: 404 }
      );
    }

    // Delete leftover without affecting product stock
    await (prisma as any).leftOver.delete({
      where: { id },
    });

    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "DELETE",
      entityType: "LEFTOVER",
      entityId: id,
      entityName: leftover.product 
        ? `${leftover.product.name} - ${leftover.custodianName}`
        : `Product ID: ${leftover.productId} - ${leftover.custodianName}`,
      oldData: leftover,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting leftover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete leftover" },
      { status: 500 }
    );
  }
}

