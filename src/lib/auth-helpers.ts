import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type { Gender, UserProfile } from "@/types/user";

export async function uploadVerificationPhoto(uid: string, photoBlob: Blob) {
  const storageRef = ref(getFirebaseStorage(), `verifications/${uid}/${Date.now()}.jpg`);
  await uploadBytes(storageRef, photoBlob, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
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
  gender: Gender,
  photoBlob: Blob
) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  const { user } = credential;

  await updateProfile(user, { displayName: username });
  await sendEmailVerification(user);

  const photoUrl = await uploadVerificationPhoto(user.uid, photoBlob);

  await saveUserProfile(user.uid, {
    username,
    email,
    gender,
    verificationPhotoUrl: photoUrl,
    genderVerified: true,
    authProvider: "email",
  });

  return user;
}

export async function completeGoogleProfile(
  uid: string,
  username: string,
  email: string,
  gender: Gender,
  photoBlob: Blob
) {
  const photoUrl = await uploadVerificationPhoto(uid, photoBlob);

  await saveUserProfile(uid, {
    username,
    email,
    gender,
    verificationPhotoUrl: photoUrl,
    genderVerified: true,
    authProvider: "google",
  });

  const currentUser = getFirebaseAuth().currentUser;
  if (currentUser) {
    await updateProfile(currentUser, { displayName: username });
  }
}
