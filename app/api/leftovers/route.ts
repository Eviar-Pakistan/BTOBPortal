import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leftovers = await (prisma as any).leftOver.findMany({
      include: {
        product: true,
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

    // Get product to check stock
    const product = await (prisma as any).product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (quantityNum > product.stock) {
      return NextResponse.json(
        { error: `Quantity cannot exceed available stock (${product.stock})` },
        { status: 400 }
      );
    }

    // Create leftover and update product stock in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const leftover = await (tx as any).leftOver.create({
        data: {
          productId,
          custodianName,
          custodianLocation,
          quantity: quantityNum,
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantityNum,
          },
        },
      });

      return leftover;
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

