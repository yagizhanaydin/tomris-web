import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { sanitizeText } from "@/lib/security/validate";
import type { Gender } from "@/types/user";
import type {
  Post,
  Comment,
  PostAudience,
  PostFilters,
  DateFilter,
  PostLocationInput,
} from "@/types/post";
import { normalizePostRegion, normalizePostCountry, TR_COUNTRY } from "@/lib/locations";

function db() {
  return getFirebaseDb();
}

/** İzleyici bu gönderiyi görebilir mi? (hedef kitle) */
export function canViewPost(post: Post, viewerGender: Gender): boolean {
  if (post.audience === "all") return true;
  return post.audience === viewerGender;
}

function inDateRange(createdAt: string, range: DateFilter): boolean {
  if (range === "all") return true;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return now - created < day;
  if (range === "week") return now - created < 7 * day;
  if (range === "month") return now - created < 30 * day;
  return true;
}

export function filterPosts(
  posts: Post[],
  filters: PostFilters,
  viewerGender: Gender
): Post[] {
  return posts.filter((post) => {
    if (!canViewPost(post, viewerGender)) return false;

    const region = normalizePostRegion(post);
    const country = normalizePostCountry(post);

    if (filters.region && region !== filters.region) return false;
    if (filters.country && country !== filters.country) return false;
    if (filters.city && post.city !== filters.city) return false;
    if (filters.district && post.district !== filters.district) return false;
    if (filters.authorGender && post.authorGender !== filters.authorGender) return false;
    if (filters.audience && post.audience !== filters.audience) return false;
    if (!inDateRange(post.createdAt, filters.dateRange)) return false;
    return true;
  });
}

export async function fetchPosts(max = 100): Promise<Post[]> {
  const q = query(
    collection(db(), "posts"),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function createPost(
  authorUid: string,
  authorUsername: string,
  authorGender: Gender,
  content: string,
  location: PostLocationInput,
  audience: PostAudience
): Promise<string> {
  const text = sanitizeText(content, 2000);
  if (!text) throw new Error("empty_content");
  if (!location.city) throw new Error("location_required");
  if (location.region === "tr" && !location.district) throw new Error("location_required");
  if (location.region === "eu" && !location.country) throw new Error("location_required");

  const now = new Date().toISOString();
  const ref = await addDoc(collection(db(), "posts"), {
    authorUid,
    authorUsername,
    authorGender,
    content: text,
    region: location.region,
    country: location.region === "tr" ? TR_COUNTRY : location.country,
    city: location.city,
    district: location.region === "tr" ? location.district : "",
    audience,
    createdAt: now,
  });
  return ref.id;
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db(), "comments"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

export async function addComment(
  postId: string,
  authorUid: string,
  authorUsername: string,
  content: string
): Promise<string> {
  const text = sanitizeText(content, 500);
  if (!text) throw new Error("empty_content");

  const now = new Date().toISOString();
  const ref = await addDoc(collection(db(), "comments"), {
    postId,
    authorUid,
    authorUsername,
    content: text,
    createdAt: now,
  });
  return ref.id;
}

export async function deletePost(postId: string, authorUid: string): Promise<void> {
  const ref = doc(db(), "posts", postId);
  const postSnap = await getDoc(ref);
  if (!postSnap.exists()) throw new Error("not_found");
  if (postSnap.data().authorUid !== authorUid) throw new Error("forbidden");

  const snap = await getDocs(
    query(collection(db(), "comments"), where("postId", "==", postId))
  );
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(ref);
}
