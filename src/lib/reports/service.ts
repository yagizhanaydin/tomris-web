import { getFirebaseAuth } from "@/lib/firebase";
import type { ReportTargetType } from "@/types/report";

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("not_authenticated");

  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}

export async function submitReport(input: {
  reporterUid: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorUid?: string;
  reason: string;
}): Promise<void> {
  const reason = input.reason.trim();
  if (reason.length < 5) throw new Error("reason_too_short");

  const res = await authFetch("/api/reports", {
    method: "POST",
    body: JSON.stringify({
      targetType: input.targetType,
      targetId: input.targetId,
      targetAuthorUid: input.targetAuthorUid,
      reason,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "report_failed");
  }
}
