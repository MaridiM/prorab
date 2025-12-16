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

// Combined UserAvatar component
interface UserAvatarProps extends Omit<AvatarProps, "children"> {
  user?: {
    fullName?: string | null
    email?: string | null
    avatarUrl?: string | null
  } | null
  fallbackClassName?: string
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ user, className, fallbackClassName, size = "md", ...props }, ref) => {
    const initials = getInitials(user?.fullName || user?.email)

    return (
      <Avatar ref={ref} size={size} className={className} {...props}>
        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || "User"} />
        <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
      </Avatar>
    )
  }
)
UserAvatar.displayName = "UserAvatar"

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, getInitials }









