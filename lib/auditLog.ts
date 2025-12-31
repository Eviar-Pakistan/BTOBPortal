import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type EntityType = "PRODUCT" | "CATEGORY" | "LEFTOVER";

interface AuditLogData {
  userId: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName?: string;
  oldData?: any;
  newData?: any;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await (prisma as any).auditLog.create({
      data: {
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        oldData: data.oldData ? JSON.parse(JSON.stringify(data.oldData)) : null,
        newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : null,
        changes: data.changes ? JSON.parse(JSON.stringify(data.changes)) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break the main operation
    console.error("Failed to create audit log:", error);
  }
}

export function getChanges(oldData: any, newData: any): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};
  
  if (!oldData || !newData) return changes;

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }
  
  return changes;
}

export function getClientInfo(req: Request) {
  const ipAddress = 
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  return { ipAddress, userAgent };
}