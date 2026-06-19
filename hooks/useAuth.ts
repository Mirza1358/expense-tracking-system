"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { ensureUserSchema } from "@/lib/users";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthState(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const current = getClientAuth().currentUser;
    if (!current) return;
    await current.reload();
    setUser(null);
    setUser(getClientAuth().currentUser);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getClientAuth(),
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        setError(null);
        if (firebaseUser) {
          ensureUserSchema(firebaseUser).catch(() => {
            // Schema bootstrap is retried on next auth action
          });
        }
      },
      (authError) => {
        setError(authError.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return useMemo(
    () => ({ user, loading, error, refreshUser }),
    [user, loading, error, refreshUser]
  );
}

export { AuthContext };
