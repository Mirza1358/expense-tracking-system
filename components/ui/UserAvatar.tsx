import Image from "next/image";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-sm rounded-full",
  md: "h-20 w-20 text-3xl rounded-2xl",
  lg: "h-24 w-24 text-4xl rounded-2xl",
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  return source[0]?.toUpperCase() ?? "U";
}

export function UserAvatar({
  name,
  email,
  photoURL,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (photoURL) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-[var(--accent-muted)] ring-2 ring-[var(--accent)]/20 ${sizeClass} ${className}`}
      >
        <Image
          src={photoURL}
          alt={name?.trim() || "Profile photo"}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-[var(--accent-muted)] font-bold text-[var(--accent)] ring-2 ring-[var(--accent)]/20 ${sizeClass} ${className}`}
    >
      {getInitials(name, email)}
    </div>
  );
}
