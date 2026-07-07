import { addDoc, collection } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { sanitizeText } from "@/lib/security/validate";
import type { ReportTargetType } from "@/types/report";

export async function submitReport(input: {
  reporterUid: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorUid?: string;
  reason: string;
}): Promise<void> {
  const reason = sanitizeText(input.reason.trim(), 500);
  if (reason.length < 5) throw new Error("reason_too_short");

  await addDoc(collection(getFirebaseDb(), "reports"), {
    reporterUid: input.reporterUid,
    reporterUsername: input.reporterUsername,
    targetType: input.targetType,
    targetId: input.targetId,
    targetAuthorUid: input.targetAuthorUid ?? null,
    reason,
    createdAt: new Date().toISOString(),
  });
}
