import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { sendTomrisEmailVerification } from "@/lib/auth/email-verification";
import { getVerificationPhotoId } from "@/lib/verification/paths";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import { findBannedTerm } from "@/lib/security/content-filter";
import { reserveUsername, UsernameTakenError, lookupUidByUsername } from "@/lib/users/usernames";
import type { Gender, UserProfile } from "@/types/user";

export { UsernameTakenError };

export async function checkEmailNotBanned(email: string): Promise<void> {
  const res = await fetch(`/api/auth/check-ban?email=${encodeURIComponent(email)}`);
  if (!res.ok) return;
  const data = await res.json();
  if (data.allowed === false) {
    throw new Error("BANNED_EMAIL");
  }
}

async function uploadVerificationPhotoToServer(photoBlob: Blob): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Oturum bulunamadı.");

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("photo", photoBlob, "verification.jpg");
  formData.append("privacyConsent", "true");

  const res = await fetch("/api/verification/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Fotoğraf yüklenemedi.");
  }

  return getVerificationPhotoId(user.uid);
}

export async function saveUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "email">
) {
  const profile: UserProfile = {
    uid,
    ...data,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(getFirebaseDb(), "users", uid), profile);
  return profile;
}

export async function registerWithEmail(
  username: string,
  email: string,
  password: string,
  gender: Gender
) {
  await checkEmailNotBanned(email);

  const normalizedUsername = normalizeUsername(username);
  if (!validateUsername(normalizedUsername)) {
    throw new Error(
      findBannedTerm(normalizedUsername) ? "CONTENT_BLOCKED" : "INVALID_USERNAME"
    );
  }

  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  const { user } = credential;

  try {
    if (await lookupUidByUsername(normalizedUsername)) {
      throw new UsernameTakenError();
    }

    await updateProfile(user, { displayName: username });
    await sendTomrisEmailVerification(user);

    const normalized = await reserveUsername(user.uid, username);

    await saveUserProfile(user.uid, {
      username: normalized,
      gender,
      verificationPhotoPath: "",
      verificationStatus: "unverified",
      genderVerified: false,
      authProvider: "email",
      chatVisibility: "friends",
    });

    return user;
  } catch (err) {
    try {
      await deleteUser(user);
    } catch {
      // Auth hesabı temizlenemediyse orphan kalabilir — nadir
    }
    throw err;
  }
}

export async function createGoogleProfile(
  uid: string,
  username: string,
  email: string,
  gender: Gender
) {
  await checkEmailNotBanned(email);

  const normalizedUsername = normalizeUsername(username);
  if (!validateUsername(normalizedUsername)) {
    throw new Error(
      findBannedTerm(normalizedUsername) ? "CONTENT_BLOCKED" : "INVALID_USERNAME"
    );
  }

  if (await lookupUidByUsername(normalizedUsername)) {
    throw new UsernameTakenError();
  }

  const normalized = await reserveUsername(uid, username);

  await saveUserProfile(uid, {
    username: normalized,
    gender,
    verificationPhotoPath: "",
    verificationStatus: "unverified",
    genderVerified: false,
    authProvider: "google",
    chatVisibility: "friends",
  });

  const currentUser = getFirebaseAuth().currentUser;
  if (currentUser) {
    await updateProfile(currentUser, { displayName: username });
  }
}

/** Fotoğraf gönder — temsilci incelemesine alınır (durum sunucuda güncellenir) */
export async function submitVerificationPhoto(photoBlob: Blob) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Oturum bulunamadı.");

  await uploadVerificationPhotoToServer(photoBlob);
}
