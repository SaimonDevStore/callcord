import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  alt: string;
  src?: string;
  className?: string;
  allowGif?: boolean;
};

export const UserAvatar = ({ alt, src, className, allowGif = true }: UserAvatarProps) => {
  const isGif = typeof src === "string" && src.toLowerCase().endsWith(".gif");
  const effectiveSrc = isGif && !allowGif ? undefined : src;
  return (
    <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
      <AvatarImage src={effectiveSrc} alt={alt} />
    </Avatar>
  );
};
