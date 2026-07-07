export type ReportTargetType = "post" | "comment" | "user";

export interface Report {
  id: string;
  reporterUid: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorUid?: string;
  reason: string;
  createdAt: string;
}
