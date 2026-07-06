import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { ChatVisibility, UserProfile } from "@/types/user";

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "users", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

export async function updateChatVisibility(
  uid: string,
  visibility: ChatVisibility
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), "users", uid), { chatVisibility: visibility });
}

export function getChatVisibility(profile: UserProfile): ChatVisibility {
  return profile.chatVisibility ?? "friends";
}
