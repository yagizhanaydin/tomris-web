/**
 * Firestore rules regression tests
 * Run: npm run test:rules
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const RULES = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const PROJECT = "tomris-rules-test";

const baseUser = {
  uid: "user-a",
  username: "ayse",
  gender: "kadin",
  verificationPhotoPath: "",
  verificationStatus: "unverified",
  genderVerified: false,
  authProvider: "email",
  chatVisibility: "friends",
  createdAt: "2026-07-06T10:00:00.000Z",
};

const approvedUser = {
  ...baseUser,
  verificationStatus: "approved",
  genderVerified: true,
};

const pendingUser = {
  ...baseUser,
  uid: "user-pending",
  username: "pending1",
  verificationStatus: "pending",
  verificationPhotoPath: "user-pending",
};

const postPayload = {
  authorUid: "user-a",
  authorUsername: "ayse",
  authorGender: "kadin",
  content: "Merhaba",
  region: "tr",
  country: "Türkiye",
  city: "İstanbul",
  district: "Kadıköy",
  audience: "all",
  createdAt: "2026-07-06T11:00:00.000Z",
};

const womenOnlyPost = { ...postPayload, audience: "kadin" };

const friendshipPayload = {
  fromUid: "user-a",
  toUid: "user-b",
  fromUsername: "ayse",
  toUsername: "zeynep",
  status: "pending",
  createdAt: "2026-07-06T11:00:00.000Z",
  updatedAt: "2026-07-06T11:00:00.000Z",
};

const dmConversation = {
  type: "dm",
  participantUids: ["user-a", "user-b"],
  participantUsernames: { "user-a": "ayse", "user-b": "zeynep" },
  createdBy: "user-a",
  createdAt: "2026-07-06T11:00:00.000Z",
  updatedAt: "2026-07-06T11:00:00.000Z",
};

const messagePayload = {
  authorUid: "user-a",
  authorUsername: "ayse",
  content: "Selam",
  createdAt: "2026-07-06T11:01:00.000Z",
};

async function seedUsers(env, users) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const u of users) {
      const { uid, ...data } = u;
      await db.collection("users").doc(uid).set({ uid, ...data });
    }
  });
}

async function runSuite() {
  const env = await initializeTestEnvironment({
    projectId: PROJECT,
    firestore: { rules: RULES, host: "127.0.0.1", port: 8080 },
  });

  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
    } catch (err) {
      results.push({ name, ok: false, error: err.message ?? String(err) });
    }
  }

  await test("user create without email field", async () => {
    const db = env.authenticatedContext("user-new").firestore();
    await assertSucceeds(
      db.collection("users").doc("user-new").set({
        uid: "user-new",
        username: "yeni",
        gender: "kadin",
        verificationPhotoPath: "",
        verificationStatus: "unverified",
        genderVerified: false,
        authProvider: "email",
        chatVisibility: "friends",
        createdAt: "2026-07-06T10:00:00.000Z",
      })
    );
  });

  await test("user create WITH email field fails", async () => {
    const db = env.authenticatedContext("user-x").firestore();
    await assertFails(
      db.collection("users").doc("user-x").set({
        uid: "user-x",
        username: "hack",
        email: "hack@test.com",
        gender: "kadin",
        verificationStatus: "unverified",
        genderVerified: false,
        createdAt: "2026-07-06T10:00:00.000Z",
      })
    );
  });

  await seedUsers(env, [
    { ...baseUser },
    { ...approvedUser },
    { ...pendingUser, uid: "user-b", username: "zeynep", gender: "kadin" },
    pendingUser,
    {
      ...baseUser,
      uid: "user-erkek",
      username: "ahmet",
      gender: "erkek",
      verificationStatus: "approved",
      genderVerified: true,
    },
  ]);

  await test("pending verification path must equal uid", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("users").doc("user-a").update({
        verificationPhotoPath: "user-a",
        verificationStatus: "pending",
        genderVerified: false,
      })
    );
  });

  await test("fake verification path rejected", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("user-a").set({
        uid: "user-a",
        ...baseUser,
        verificationStatus: "unverified",
      });
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("users").doc("user-a").update({
        verificationPhotoPath: "fake-path",
        verificationStatus: "pending",
        genderVerified: false,
      })
    );
  });

  await test("user CANNOT self-set approved", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("users").doc("user-a").update({
        verificationStatus: "approved",
        genderVerified: true,
      })
    );
  });

  await test("approved user CAN create post with matching gender", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("users").doc("user-a").set({
        uid: "user-a",
        ...approvedUser,
      });
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("posts").add(postPayload));
  });

  await test("approved user CANNOT fake authorGender on post", async () => {
    const db = env.authenticatedContext("user-erkek").firestore();
    await assertFails(
      db.collection("posts").add({
        ...postPayload,
        authorUid: "user-erkek",
        authorUsername: "ahmet",
        authorGender: "kadin",
        audience: "all",
      })
    );
  });

  await test("erkek user CANNOT read kadin-only post", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("posts").doc("pw1").set(womenOnlyPost);
    });
    const db = env.authenticatedContext("user-erkek").firestore();
    await assertFails(db.collection("posts").doc("pw1").get());
  });

  await test("kadin user CAN read kadin-only post", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("posts").doc("pw1").get());
  });

  await test("approved user CAN send friend request with valid usernames", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("friendships").add(friendshipPayload));
  });

  await test("wrong fromUsername on friendship fails", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("friendships").add({
        ...friendshipPayload,
        fromUsername: "fake",
      })
    );
  });

  await test("client CANNOT write signals", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("signals").add({ uid: "user-a", createdAt: "2026-07-06T12:00:00.000Z" })
    );
  });

  await test("client CANNOT read verification_photos", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("verification_photos").doc("user-a").set({ x: 1 });
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(db.collection("verification_photos").doc("user-a").get());
  });

  await env.cleanup();
  return results;
}

console.log("Firestore Rules Test Suite\n");
const results = await runSuite();
const passed = results.filter((r) => r.ok).length;
for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.error ? `\n    → ${r.error}` : ""}`);
}
console.log(`\nSonuç: ${passed}/${results.length} geçti`);
process.exit(passed === results.length ? 0 : 1);
