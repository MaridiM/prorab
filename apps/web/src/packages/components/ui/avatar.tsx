"use client"

import * as React from "react"
import { cn } from "@/packages/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)

    if (!src || hasError) {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn("aspect-square h-full w-full object-cover", className)}
        onError={() => setHasError(true)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
AvatarFallback.displayName = "AvatarFallback"

// Helper function to get initials
function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Donator badge size mapping
const badgeSizeClasses = {
  xs: "h-2.5 w-2.5 -bottom-0.5 -right-0.5",
  sm: "h-3 w-3 -bottom-0.5 -right-0.5",
  md: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  lg: "h-4 w-4 -bottom-1 -right-1",
  xl: "h-5 w-5 -bottom-1 -right-1",
}

// Combined UserAvatar component
interface UserAvatarProps extends Omit<AvatarProps, "children"> {
  user?: {
    fullName?: string | null
    email?: string | null
    avatarUrl?: string | null
    hasDonatorBadge?: boolean | null
  } | null
  fallbackClassName?: string
  showBadge?: boolean
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ user, className, fallbackClassName, size = "md", showBadge = true, ...props }, ref) => {
    const initials = getInitials(user?.fullName || user?.email)
    const hasBadge = showBadge && user?.hasDonatorBadge

    return (
      <div className="relative inline-block">
        <Avatar ref={ref} size={size} className={className} {...props}>
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || "User"} />
          <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
        </Avatar>
        {hasBadge && (
          <div
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30 ring-2 ring-background",
              badgeSizeClasses[size]
            )}
            title="Благодарный донатор"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-2/3 h-2/3 text-white"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}
      </div>
    )
  }
)
UserAvatar.displayName = "UserAvatar"

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, getInitials }















