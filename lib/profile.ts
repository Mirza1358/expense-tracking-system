import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientAuth, getClientDb } from "./firebase";
import { deleteAvatar, uploadAvatar } from "./storage";
import { updateProfileSchema } from "./validators/user";
import { ZodError } from "zod";

export interface SaveProfileInput {
  displayName: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}

export function getProfileErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Invalid profile data.";
  }

  if (error instanceof Error) {
    if (error.message.includes("storage/unauthorized")) {
      return "You do not have permission to upload this image.";
    }
    if (error.message.includes("storage/")) {
      return "Failed to upload image. Please try again.";
    }
    return error.message;
  }
  return "Failed to update profile. Please try again.";
}

export async function saveUserProfile(
  input: SaveProfileInput
): Promise<{ displayName: string; photoURL: string | null }> {
  const auth = getClientAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to update your profile.");
  }

  const { displayName } = updateProfileSchema.parse({
    displayName: input.displayName,
  });

  let photoURL = user.photoURL ?? null;

  if (input.removeAvatar && photoURL) {
    await deleteAvatar(photoURL).catch(() => {
      // Old file may already be gone
    });
    photoURL = null;
  } else if (input.avatarFile) {
    if (photoURL) {
      await deleteAvatar(photoURL).catch(() => {
        // Old file may already be gone
      });
    }
    photoURL = await uploadAvatar(user.uid, input.avatarFile);
  }

  await updateProfile(user, {
    displayName,
    photoURL: photoURL ?? undefined,
  });
  await user.reload();

  const userRef = doc(getClientDb(), "users", user.uid);
  const snapshot = await getDoc(userRef);
  const existing = snapshot.data();
  const now = new Date().toISOString();

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email ?? existing?.email ?? "",
      displayName,
      photoURL,
      provider:
        existing?.provider ?? user.providerData[0]?.providerId ?? "password",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true }
  );

  return { displayName, photoURL };
}
