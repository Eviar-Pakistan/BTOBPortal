import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // Get old data before update
    const oldCategory = await (prisma as any).category.findUnique({
      where: { id },
    });

    if (!oldCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }


    const category = await (prisma as any).category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });


    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "UPDATE",
      entityType: "CATEGORY",
      entityId: category.id,
      entityName: category.name,
      oldData: oldCategory,
      newData: category,
      changes: getChanges(oldCategory, category),
      ipAddress,
      userAgent,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await (prisma as any).category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch category" },
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

    // Get category data before deletion
    const category = await (prisma as any).category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }



    await (prisma as any).category.delete({
      where: { id },
    });

    // Create audit log
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      userId: session.user.id!,
      userName: session.user.name || undefined,
      userEmail: session.user.email || undefined,
      action: "DELETE",
      entityType: "CATEGORY",
      entityId: id,
      entityName: category.name,
      oldData: category,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

