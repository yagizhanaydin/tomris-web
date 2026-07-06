import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { getVerificationPhotoId } from "@/lib/verification/paths";
import { normalizeUsername, validateUsername } from "@/lib/security/validate";
import { findBannedTerm } from "@/lib/security/content-filter";
import type { Gender, UserProfile } from "@/types/user";

export async function checkEmailNotBanned(email: string): Promise<void> {
  const res = await fetch(`/api/auth/check-ban?email=${encodeURIComponent(email)}`);
  if (!res.ok) return;
  const data = await res.json();
  if (data.banned) {
    throw new Error("BANNED_EMAIL");
  }
}

async function uploadVerificationPhotoToServer(photoBlob: Blob): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Oturum bulunamadı.");

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("photo", photoBlob, "verification.jpg");

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
  data: Omit<UserProfile, "uid" | "createdAt">
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

  await updateProfile(user, { displayName: username });
  await sendEmailVerification(user);

  await saveUserProfile(user.uid, {
    username: normalizeUsername(username),
    email,
    gender,
    verificationPhotoPath: "",
    verificationStatus: "unverified",
    genderVerified: false,
    authProvider: "email",
    chatVisibility: "friends",
  });

  return user;
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

  await saveUserProfile(uid, {
    username: normalizedUsername,
    email,
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

/** Fotoğraf gönder — temsilci incelemesine alınır */
export async function submitVerificationPhoto(photoBlob: Blob) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Oturum bulunamadı.");

  const photoId = await uploadVerificationPhotoToServer(photoBlob);

  await updateDoc(doc(getFirebaseDb(), "users", user.uid), {
    verificationPhotoPath: photoId,
    verificationStatus: "pending",
    genderVerified: false,
  });
}
