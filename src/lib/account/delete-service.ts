import { getAuth } from "firebase-admin/auth";
import type { Query } from "firebase-admin/firestore";
import { getAdminApp, getAdminDb } from "@/lib/firebase-admin";
import { deleteLocalPhoto } from "@/lib/verification/local-storage";
import type { UserProfile } from "@/types/user";

async function deleteQueryBatch(query: Query, batchSize = 100): Promise<void> {
  const snap = await query.limit(batchSize).get();
  if (snap.empty) return;

  const batch = getAdminDb().batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  if (snap.size >= batchSize) {
    await deleteQueryBatch(query, batchSize);
  }
}

/** KVKK — kullanıcı hesabını ve ilişkili verileri kalıcı sil */
export async function deleteUserAccount(uid: string): Promise<void> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const profile = userSnap.data() as UserProfile;
    await deleteLocalPhoto(profile.verificationPhotoPath || uid);
  } else {
    await deleteLocalPhoto(uid);
  }

  await deleteQueryBatch(
    db.collection("friendships").where("fromUid", "==", uid)
  );
  await deleteQueryBatch(
    db.collection("friendships").where("toUid", "==", uid)
  );
  await deleteQueryBatch(
    db.collection("blocks").where("blockerUid", "==", uid)
  );
  await deleteQueryBatch(
    db.collection("blocks").where("blockedUid", "==", uid)
  );

  const postsSnap = await db.collection("posts").where("authorUid", "==", uid).get();
  for (const postDoc of postsSnap.docs) {
    await deleteQueryBatch(
      db.collection("comments").where("postId", "==", postDoc.id)
    );
    await postDoc.ref.delete();
  }

  await deleteQueryBatch(
    db.collection("comments").where("authorUid", "==", uid)
  );

  const convSnap = await db
    .collection("conversations")
    .where("participantUids", "array-contains", uid)
    .get();

  for (const convDoc of convSnap.docs) {
    await deleteQueryBatch(
      db.collection("conversations").doc(convDoc.id).collection("messages").where("authorUid", "==", uid)
    );

    const data = convDoc.data();
    if (data.type === "dm") {
      await deleteQueryBatch(
        db.collection("conversations").doc(convDoc.id).collection("messages")
      );
      await convDoc.ref.delete();
    } else {
      const remaining = (data.participantUids as string[]).filter((id) => id !== uid);
      const usernames = { ...(data.participantUsernames as Record<string, string>) };
      delete usernames[uid];
      if (remaining.length === 0) {
        await deleteQueryBatch(
          db.collection("conversations").doc(convDoc.id).collection("messages")
        );
        await convDoc.ref.delete();
      } else {
        await convDoc.ref.update({
          participantUids: remaining,
          participantUsernames: usernames,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  await userRef.delete();

  try {
    await getAuth(getAdminApp()).deleteUser(uid);
  } catch {
    // Auth kaydı yoksa devam
  }
}
