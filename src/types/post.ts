import type { Gender } from "./user";

/** Gönderiyi kimler görebilir */
export type PostAudience = "all" | "kadin" | "erkek";

export type PostRegion = "tr" | "eu";

export interface Post {
  id: string;
  authorUid: string;
  authorUsername: string;
  authorGender: Gender;
  content: string;
  /** tr = Türkiye (il+ilçe), eu = Avrupa (ülke+şehir) */
  region?: PostRegion;
  country?: string;
  city: string;
  district: string;
  audience: PostAudience;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export type DateFilter = "all" | "today" | "week" | "month";

export interface PostFilters {
  region: PostRegion | "";
  country: string;
  city: string;
  district: string;
  authorGender: Gender | "";
  audience: PostAudience | "";
  dateRange: DateFilter;
}

export const DEFAULT_POST_FILTERS: PostFilters = {
  region: "",
  country: "",
  city: "",
  district: "",
  authorGender: "",
  audience: "",
  dateRange: "all",
};

export interface PostLocationInput {
  region: PostRegion;
  country: string;
  city: string;
  district: string;
}
