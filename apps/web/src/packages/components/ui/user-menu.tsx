"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut, ChevronDown, Shield } from "lucide-react"

import { useAuth } from "@/packages/libs/auth"
import { UserAvatar } from "./avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu"
import { cn } from "@/packages/utils"

interface UserMenuProps {
  className?: string
  showChevron?: boolean
  showName?: boolean
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl"
}

export function UserMenu({
  className,
  showChevron = false,
  showName = false,
  avatarSize = "sm",
}: UserMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [open, setOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  if (!user) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-xl p-1.5 transition-all",
            "hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            open && "bg-secondary/50",
            className
          )}
        >
          <UserAvatar user={user} size={avatarSize} />
          {showName && (
            <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
              {user.fullName || user.email?.split("@")[0]}
            </span>
          )}
          {showChevron && (
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">
            {user.fullName || "Пользователь"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Menu Items */}
        <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
          <Settings className="w-4 h-4" />
          Настройки
        </DropdownMenuItem>
        
        {/* Admin Panel - only show if user has admin role */}
        {user.adminRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigate("/admin")}>
              <Shield className="w-4 h-4" />
              Админ-панель
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} destructive>
          <LogOut className="w-4 h-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
