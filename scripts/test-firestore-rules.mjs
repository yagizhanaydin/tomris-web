/**
 * Firestore rules regression tests — repo rules vs user-pasted rules.
 * Run: node scripts/test-firestore-rules.mjs
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

const RULES_REPO = fs.readFileSync(path.join(root, "firestore.rules"), "utf8");
const RULES_PASTED = fs.readFileSync(
  path.join(root, "firestore.rules.user-pasted"),
  "utf8"
);

const PROJECT = "tomris-rules-test";

const baseUser = {
  uid: "user-a",
  username: "ayse",
  email: "ayse@test.com",
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
  email: "pending@test.com",
  verificationStatus: "pending",
  verificationPhotoPath: "verifications/user-pending",
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

async function runSuite(label, rules) {
  const env = await initializeTestEnvironment({
    projectId: `${PROJECT}-${label.replace(/\W/g, "")}`,
    firestore: { rules, host: "127.0.0.1", port: 8080 },
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

  // --- USERS ---
  await test("unverified user can register profile (create)", async () => {
    const db = env.authenticatedContext("user-new").firestore();
    await assertSucceeds(
      db.collection("users").doc("user-new").set({
        uid: "user-new",
        ...baseUser,
        uid: undefined,
        username: "yeni",
        email: "yeni@test.com",
      })
    );
  });

  await seedUsers(env, [
    { ...baseUser },
    { ...approvedUser },
    { ...pendingUser, uid: "user-b", username: "zeynep", email: "z@test.com" },
    pendingUser,
  ]);

  await test("pending user can submit verification (update → pending)", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("users").doc("user-a").update({
        verificationPhotoPath: "verifications/user-a",
        verificationStatus: "pending",
        genderVerified: false,
      })
    );
  });

  await test("user CANNOT self-set verificationStatus to approved", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("users").doc("user-a").update({
        verificationStatus: "approved",
        genderVerified: true,
      })
    );
  });

  await test("user can update chatVisibility only (settings)", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("users").doc("user-a").update({ chatVisibility: "everyone" })
    );
  });

  // --- POSTS read/write ---
  await test("unverified user can READ posts", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("posts").doc("p1").set(postPayload);
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("posts").doc("p1").get());
  });

  await test("unverified user CANNOT create post", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(db.collection("posts").add(postPayload));
  });

  await test("pending user CANNOT create post", async () => {
    const db = env.authenticatedContext("user-pending").firestore();
    await assertFails(
      db.collection("posts").add({ ...postPayload, authorUid: "user-pending" })
    );
  });

  await test("approved user CAN create post", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("posts").add(postPayload));
  });

  // --- COMMENTS ---
  await test("approved user CAN create comment", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("comments").add({
        postId: "p1",
        authorUid: "user-a",
        authorUsername: "ayse",
        content: "Yorum",
        createdAt: "2026-07-06T11:00:00.000Z",
      })
    );
  });

  await test("pending user CANNOT create comment", async () => {
    const db = env.authenticatedContext("user-pending").firestore();
    await assertFails(
      db.collection("comments").add({
        postId: "p1",
        authorUid: "user-pending",
        authorUsername: "pending1",
        content: "Yorum",
        createdAt: "2026-07-06T11:00:00.000Z",
      })
    );
  });

  // --- FRIENDSHIPS ---
  await test("unverified user CANNOT send friend request (repo expectation)", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(db.collection("friendships").add(friendshipPayload));
  });

  await test("approved user CAN send friend request", async () => {
    // user-a is now approved in seed for approved tests - re-seed approved
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx
        .firestore()
        .collection("users")
        .doc("user-a")
        .set({ uid: "user-a", ...approvedUser });
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(db.collection("friendships").add(friendshipPayload));
  });

  // --- CHAT ---
  await test("approved user CAN create DM conversation", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("conversations").doc("dm-a-b").set(dmConversation)
    );
  });

  await test("approved user CAN send message + update lastMessage fields", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertSucceeds(
      db.collection("conversations").doc("dm-a-b").collection("messages").add(messagePayload)
    );
    await assertSucceeds(
      db.collection("conversations").doc("dm-a-b").update({
        lastMessageText: "Selam",
        lastMessageAt: "2026-07-06T11:01:00.000Z",
        lastMessageAuthorUid: "user-a",
        updatedAt: "2026-07-06T11:01:00.000Z",
      })
    );
  });

  await test("pending user CANNOT send message", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("conversations").doc("dm-p-b").set({
        ...dmConversation,
        participantUids: ["user-pending", "user-b"],
        participantUsernames: { "user-pending": "pending1", "user-b": "zeynep" },
      });
    });
    const db = env.authenticatedContext("user-pending").firestore();
    await assertFails(
      db
        .collection("conversations")
        .doc("dm-p-b")
        .collection("messages")
        .add({ ...messagePayload, authorUid: "user-pending", authorUsername: "pending1" })
    );
  });

  // --- SIGNALS & BANS ---
  await test("client CANNOT write signals (repo expectation)", async () => {
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(
      db.collection("signals").add({ uid: "user-a", createdAt: "2026-07-06T12:00:00.000Z" })
    );
  });

  await test("client CANNOT read platform_bans", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore().collection("platform_bans").doc("b1").set({ email: "x@test.com" });
    });
    const db = env.authenticatedContext("user-a").firestore();
    await assertFails(db.collection("platform_bans").doc("b1").get());
  });

  await env.cleanup();
  return { label, results };
}

function summarize(suite) {
  const passed = suite.results.filter((r) => r.ok).length;
  const failed = suite.results.filter((r) => !r.ok);
  return { ...suite, passed, total: suite.results.length, failed };
}

console.log("Firestore Rules Test Suite\n");

const repo = summarize(await runSuite("REPO (firestore.rules)", RULES_REPO));
const pasted = summarize(await runSuite("PASTED (Console'daki eski sürüm)", RULES_PASTED));

function printSuite(suite) {
  console.log(`\n=== ${suite.label} ===`);
  console.log(`Sonuç: ${suite.passed}/${suite.total} geçti\n`);
  for (const r of suite.results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.error ? `\n    → ${r.error}` : ""}`);
  }
}

printSuite(repo);
printSuite(pasted);

// Security diff report
console.log("\n=== GÜVENLİK FARK RAPORU (yapıştırdığın vs repo) ===\n");
const securityChecks = [
  {
    id: "self-approve",
    name: "Kullanıcı kendini approved yapabilir mi?",
    repo: "HAYIR (userSelfUpdateAllowed)",
    pasted: "EVET — KRİTİK AÇIK",
  },
  {
    id: "friend-pending",
    name: "Doğrulanmamış arkadaşlık isteği?",
    repo: "HAYIR (isApproved gerekli)",
    pasted: "EVET — pending/unverified gönderebilir",
  },
  {
    id: "block-pending",
    name: "Doğrulanmamış engelleme?",
    repo: "HAYIR",
    pasted: "EVET",
  },
  {
    id: "signals",
    name: "signals client yazımı",
    repo: "KAPALI (write: false)",
    pasted: "AÇIK (her giriş yapan yazabilir)",
  },
  {
    id: "chat-lastmsg",
    name: "Mesaj sonrası lastMessage güncelleme",
    repo: "Sadece belirli alanlar (lastMessageUpdateAllowed)",
    pasted: "Herhangi participant geniş update",
  },
  {
    id: "posts-pending-read",
    name: "Pending kullanıcı akış okuyabilir mi?",
    repo: "EVET (read: isSignedIn)",
    pasted: "EVET",
  },
  {
    id: "posts-pending-write",
    name: "Pending kullanıcı gönderi yazabilir mi?",
    repo: "HAYIR",
    pasted: "HAYIR",
  },
];

for (const c of securityChecks) {
  console.log(`• ${c.name}`);
  console.log(`  Repo:   ${c.repo}`);
  console.log(`  Yapıştırılan: ${c.pasted}\n`);
}

const repoFail = repo.failed.length;
const pastedFail = pasted.failed.length;

console.log("=== ÖNERİ ===");
if (pastedFail > repoFail) {
  console.log("Firebase Console'daki yapıştırdığın kurallar GÜNCEL DEĞİL.");
  console.log("Repodaki firestore.rules dosyasını Console'a Publish et.");
} else {
  console.log("Repodaki kurallar uygulama ile uyumlu — Console'a publish edildiğinden emin ol.");
}

process.exit(repoFail > 0 ? 1 : 0);
