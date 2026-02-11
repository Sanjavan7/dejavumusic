import Image from "next/image";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export default function UserAvatar({ username, avatarUrl, size = "md" }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={username}
        width={size === "lg" ? 48 : size === "md" ? 36 : 28}
        height={size === "lg" ? 48 : size === "md" ? 36 : 28}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold`}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
