import { doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { getClientDb } from "./firebase";
import { userProfileSchema } from "./validators/user";
import { UserProfile, UserRootDocument } from "@/types/firestore";

function getProvider(user: User): string {
  return user.providerData[0]?.providerId ?? "password";
}

export async function initializeUserSchema(user: User): Promise<void> {
  const db = getClientDb();
  const now = new Date().toISOString();

  const profile: UserProfile = userProfileSchema.parse({
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    provider: getProvider(user),
    createdAt: now,
    updatedAt: now,
  });

  const rootDoc: UserRootDocument = {
    ownerId: user.uid,
    createdAt: now,
  };

  await Promise.all([
    setDoc(doc(db, "users", user.uid), profile),
    setDoc(doc(db, "expenses", user.uid), rootDoc, { merge: true }),
    setDoc(doc(db, "summaries", user.uid), rootDoc, { merge: true }),
  ]);
}

export async function ensureUserSchema(user: User): Promise<void> {
  const userRef = doc(getClientDb(), "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return;
  }
  await initializeUserSchema(user);
}

export async function touchUserProfile(user: User): Promise<void> {
  const userRef = doc(getClientDb(), "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await initializeUserSchema(user);
    return;
  }

  await setDoc(
    userRef,
    userProfileSchema.parse({
      ...snapshot.data(),
      email: user.email ?? snapshot.data()?.email ?? "",
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      provider: getProvider(user),
      updatedAt: new Date().toISOString(),
    })
  );
}
