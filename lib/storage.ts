import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getClientStorage } from "./firebase";
import { validateAvatarFile } from "./validators/user";

function getPathFromDownloadUrl(url: string): string | null {
  try {
    const match = url.match(/\/o\/(.+?)(\?|$)/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export async function uploadReceipt(
  uid: string,
  expenseId: string,
  file: File
): Promise<string> {
  const storage = getClientStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageRef = ref(
    storage,
    `receipts/${uid}/${expenseId}/${Date.now()}_${safeName}`
  );
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteReceipt(receiptURL: string): Promise<void> {
  if (!receiptURL) return;
  const path = getPathFromDownloadUrl(receiptURL);
  if (!path) return;
  await deleteObject(ref(getClientStorage(), path));
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  validateAvatarFile(file);

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";

  const storageRef = ref(getClientStorage(), `avatars/${uid}/profile.${ext}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteAvatar(photoURL: string): Promise<void> {
  await deleteReceipt(photoURL);
}
