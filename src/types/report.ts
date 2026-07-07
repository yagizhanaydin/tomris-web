export type ReportTargetType = "post" | "comment" | "user" | "conversation";

export type ReportMessageContext = {
  messageId: string;
  authorUid: string;
  authorUsername: string;
  content: string;
  createdAt: string;
};

export interface Report {
  id: string;
  reporterUid: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetId: string;
  targetAuthorUid?: string | null;
  reason: string;
  conversationId?: string | null;
  messageContext?: ReportMessageContext[];
  status: "open" | "resolved";
  createdAt: string;
}
