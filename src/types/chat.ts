import type { PostRegion, PostLocationInput } from "@/types/post";

export type { PostLocationInput };

export type ConversationType = "dm" | "group";
export type GroupRole = "admin" | "member";

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
  /** Grup — kurucu yönetici */
  title?: string;
  adminUid?: string;
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
