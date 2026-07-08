import type { PostRegion, PostLocationInput } from "@/types/post";

export type { PostLocationInput };

export type ConversationType = "dm" | "group";
export type GroupRole = "admin" | "member";
export type GroupJoinMode = "approval" | "open";

export interface GroupJoinRequest {
  uid: string;
  username: string;
  requestedAt: string;
}

export interface PublicGroupListing {
  id: string;
  title: string;
  region?: PostRegion;
  country?: string;
  city?: string;
  district?: string;
  updatedAt: string;
  memberCount: number;
  isMember: boolean;
  joinPending: boolean;
  joinMode: GroupJoinMode;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participantUids: string[];
  participantUsernames: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  lastMessageAuthorUid?: string;
  /** Grup — kurucu lider */
  title?: string;
  adminUid?: string;
  /** Varsayılan: onaylı katılım */
  joinMode?: GroupJoinMode;
  region?: PostRegion;
  country?: string;
  city?: string;
  district?: string;
}

export interface ChatMessage {
  id: string;
  authorUid: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface GroupFilters {
  region: PostRegion | "";
  country: string;
  city: string;
  district: string;
}

export const DEFAULT_GROUP_FILTERS: GroupFilters = {
  region: "",
  country: "",
  city: "",
  district: "",
};
