export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRootDocument {
  ownerId: string;
  createdAt: string;
}
