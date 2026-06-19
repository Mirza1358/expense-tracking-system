import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getClientAuth } from "./firebase";
import { ensureUserSchema, initializeUserSchema } from "./users";
import {
  validateLoginInput,
  validateResetPasswordInput,
  validateSignUpCredentials,
} from "./validators/auth";

export async function signUp(email: string, password: string): Promise<User> {
  const validated = validateSignUpCredentials(email, password);
  const credential = await createUserWithEmailAndPassword(
    getClientAuth(),
    validated.email,
    validated.password
  );
  await initializeUserSchema(credential.user);
  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const validated = validateLoginInput({ email, password });
  const credential = await signInWithEmailAndPassword(
    getClientAuth(),
    validated.email,
    validated.password
  );
  await ensureUserSchema(credential.user);
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  const validated = validateResetPasswordInput({ email });
  await sendPasswordResetEmail(getClientAuth(), validated.email);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth());
}

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : error instanceof Error
        ? error.message.match(/\((auth\/[^)]+)\)/)?.[1]
        : undefined;

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters with upper, lower, and a number.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      break;
  }

  if (error instanceof Error && !error.message.startsWith("Firebase:")) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
