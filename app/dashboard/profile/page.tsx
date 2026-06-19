"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { doc, getDoc } from "firebase/firestore";
import {
  Calendar,
  Camera,
  Copy,
  Check,
  LogOut,
  Mail,
  Shield,
  Wallet,
  Receipt,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { signOut } from "@/lib/auth";
import { getClientDb } from "@/lib/firebase";
import { getProfileErrorMessage, saveUserProfile } from "@/lib/profile";
import { showPromise } from "@/lib/toast";
import { updateProfileSchema } from "@/lib/validators/user";
import {
  aggregateExpenses,
  formatCurrency,
  getCurrentMonthKey,
} from "@/lib/utils";
import { UserProfile } from "@/types/firestore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(getClientDb(), "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      })
      .catch(() => {
        // profile optional
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? profile?.displayName ?? "");
    setAvatarPreview(user.photoURL ?? profile?.photoURL ?? null);
    setAvatarFile(null);
    setRemoveAvatar(false);
  }, [user, profile]);

  const stats = useMemo(() => {
    const allTime = aggregateExpenses(expenses);
    const thisMonth = aggregateExpenses(
      expenses.filter((e) => e.date.startsWith(getCurrentMonthKey()))
    );
    return { allTime, thisMonth };
  }, [expenses]);

  const handleSignOut = () => {
    showPromise(signOut(), {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: "Failed to sign out",
    }).then(() => router.push("/auth/login"));
  };

  const copyUid = async () => {
    if (!user?.uid) return;
    await navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarFile) {
      setAvatarFile(null);
      setAvatarPreview(user?.photoURL ?? profile?.photoURL ?? null);
      return;
    }

    setRemoveAvatar(true);
    setAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setNameError(null);

    const parsed = updateProfileSchema.safeParse({ displayName });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Invalid display name");
      return;
    }

    setSaving(true);

    try {
      const result = await showPromise(
        saveUserProfile({
          displayName: parsed.data.displayName,
          avatarFile,
          removeAvatar,
        }),
        {
          loading: "Saving profile...",
          success: "Profile updated",
          error: "Failed to update profile",
        },
        { mapError: getProfileErrorMessage }
      );

      await refreshUser();
      setProfile((current) =>
        current
          ? {
              ...current,
              displayName: result.displayName,
              photoURL: result.photoURL,
              updatedAt: new Date().toISOString(),
            }
          : current
      );
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarPreview(result.photoURL);
    } catch {
      // Error toast already shown by showPromise
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const memberSince = user.metadata.creationTime
    ? format(new Date(user.metadata.creationTime), "MMMM d, yyyy")
    : "Unknown";

  const provider =
    user.providerData[0]?.providerId === "google.com"
      ? "Google"
      : "Email & password";

  const currentPhoto = user.photoURL ?? profile?.photoURL ?? null;
  const hasAvatar = Boolean(avatarPreview);
  const profileDirty =
    displayName.trim() !== (user.displayName ?? profile?.displayName ?? "").trim() ||
    avatarFile !== null ||
    (removeAvatar && Boolean(currentPhoto));

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Profile
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Your account, spending overview, and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <UserAvatar
                name={displayName}
                email={user.email}
                photoURL={avatarPreview}
                size="lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg transition hover:bg-[var(--surface-raised)]"
                aria-label="Upload profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {hasAvatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveAvatar}
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </Button>
            )}

            <p className="max-w-[180px] text-center text-xs text-[var(--text-secondary)]">
              JPG, PNG, WebP, or GIF. Max 2 MB.
            </p>
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <Input
              id="displayName"
              label="Display name"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setNameError(null);
              }}
              placeholder="Your name"
              error={nameError ?? undefined}
              maxLength={80}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Badge>{provider}</Badge>
              <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Calendar className="h-3.5 w-3.5" />
                Member since {memberSince}
              </p>
            </div>

            <p className="truncate text-sm text-[var(--text-secondary)]">
              {user.email}
            </p>

            <Button
              type="button"
              onClick={handleSaveProfile}
              loading={saving}
              disabled={!profileDirty || saving}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Total spent
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
                {expensesLoading
                  ? "—"
                  : formatCurrency(stats.allTime.totalSpent)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                All time
              </p>
            </div>
            <Wallet className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                This month
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
                {expensesLoading
                  ? "—"
                  : formatCurrency(stats.thisMonth.totalSpent)}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </Card>
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Expenses
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
                {expensesLoading ? "—" : stats.allTime.transactionCount}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Recorded
              </p>
            </div>
            <Receipt className="h-5 w-5 text-[var(--accent)]" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <dl className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                Email
              </dt>
              <dd className="mt-1 truncate text-sm text-[var(--text-primary)]">
                {user.email}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-raised)] p-3.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                User ID
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-[var(--text-primary)]">
                {user.uid}
              </dd>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={copyUid}
              aria-label="Copy user ID"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between rounded-xl bg-[var(--surface-raised)] p-4">
          <div>
            <p className="font-medium text-[var(--text-primary)]">Appearance</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Switch between dark and light mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="border-rose-500/20">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
        </CardHeader>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          End your session on this device. You can sign back in anytime.
        </p>
        <Button variant="danger" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </Card>
    </div>
  );
}
