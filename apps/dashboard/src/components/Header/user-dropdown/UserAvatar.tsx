interface UserAvatarProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export const UserAvatar = ({ src, alt = "User", size = "sm" }: UserAvatarProps) => {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full p-[2px] bg-linear-to-tr from-[#fbbf24] via-[#ec4899] to-[#8b5cf6]`}
    >
      <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );
};
