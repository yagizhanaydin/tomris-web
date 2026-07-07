import { getFirebaseAuth } from "@/lib/firebase";

async function authFetch(path: string): Promise<Response> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("not_authenticated");

  const token = await user.getIdToken();
  return fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function searchUsersViaApi(
  prefix: string,
  options?: { excludeUid?: string; limit?: number }
): Promise<{ uid: string; username: string }[]> {
  const params = new URLSearchParams({ prefix });
  if (options?.excludeUid) params.set("excludeUid", options.excludeUid);
  if (options?.limit) params.set("limit", String(options.limit));

  const res = await authFetch(`/api/users/search?${params}`);
  if (!res.ok) throw new Error("search_failed");

  const data = await res.json();
  return data.users ?? [];
}

export async function lookupUserViaApi(
  username: string
): Promise<{ uid: string; username: string } | null> {
  const params = new URLSearchParams({ username });
  const res = await authFetch(`/api/users/lookup?${params}`);
  if (!res.ok) throw new Error("lookup_failed");

  const data = await res.json();
  return data.user ?? null;
}
