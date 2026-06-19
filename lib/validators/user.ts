import { z } from "zod";

export const userProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().max(254),
  displayName: z.string().max(120).nullable(),
  photoURL: z.string().max(2048).nullable(),
  provider: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(80, "Display name must be 80 characters or less"),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function validateAvatarFile(file: File): void {
  if (!AVATAR_TYPES.includes(file.type as (typeof AVATAR_TYPES)[number])) {
    throw new Error("Please upload a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }
}
