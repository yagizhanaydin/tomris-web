import { getAdminDb } from "@/lib/firebase-admin";
import type { Report } from "@/types/report";

export async function listOpenReports(limit = 50): Promise<Report[]> {
  const snap = await getAdminDb()
    .collection("reports")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function resolveReport(reportId: string): Promise<void> {
  await getAdminDb().collection("reports").doc(reportId).update({
    status: "resolved",
    resolvedAt: new Date().toISOString(),
  });
}
