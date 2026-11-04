"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAvatarUrl, cleanPublicUsername } from "@/lib/supabase/social";
import type { User } from "@supabase/supabase-js";
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Loader2,
  UserCheck,
  Bookmark,
  Compass,
  LayoutDashboard,
} from "lucide-react";

export interface UserIdentity {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}

export function extractUserIdentity(user: User): UserIdentity {
  const metadata = user.user_metadata || {};
  const rawUsername =
    metadata.preferred_username ||
    metadata.user_name ||
    user.email?.split("@")[0] ||
    null;
  const username = cleanPublicUsername(rawUsername);

  // Pick display name, but never use an email address
  let candidateDisplayName =
    metadata.custom_claims?.global_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username;

  if (typeof candidateDisplayName === "string" && candidateDisplayName.includes("@")) {
    candidateDisplayName = null;
  }

  const displayName = candidateDisplayName
    ? String(candidateDisplayName).slice(0, 60)
    : username || "Cultivator";

  const avatarUrl = sanitizeAvatarUrl(metadata.avatar_url || metadata.picture);

  return {
    displayName,
    username,
    avatarUrl,
  };
}

interface AccountMenuContentProps {
  user: User | null;
  loginUrl: string;
  onClose: () => void;
  onOpenBookmarks?: () => void;
}

export function AccountMenuContent({
  user,
  loginUrl,
  onClose,
  onOpenBookmarks,
}: AccountMenuContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="p-2">
        <div className="px-2.5 py-2 border-b border-[#414559]/60 mb-1.5">
          <p className="text-xs font-semibold text-[#c6d0f5]">Cultivator Account</p>
          <p className="mt-0.5 text-[11px] text-[#a5adce]">
            Sign in to like chapters, join discussions, and sync progress.
          </p>
        </div>
        <Link
          href={loginUrl}
          onClick={onClose}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#5865F2] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4752c4] transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Login with Discord</span>
        </Link>
      </div>
    );
  }

  const { displayName, username, avatarUrl } = extractUserIdentity(user);

  return (
    <div>
      {/* User Info Header */}
      <div className="flex items-center space-x-2.5 border-b border-[#414559] px-3 py-2.5">
        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-[#51576d] bg-[#292c3c]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#414559] text-xs font-mono text-[#8caaee]">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[#c6d0f5]">{displayName}</p>
          {username && (
            <p className="truncate font-mono text-[10px] text-[#a5adce]">@{username}</p>
          )}
          <div className="mt-0.5 flex items-center space-x-1 font-mono text-[9px] uppercase tracking-wider text-[#a6d189]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
            <span>Discord Connected</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <Link
          href="/account#profile"
          onClick={onClose}
          className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
        >
          <UserCheck className="h-3.5 w-3.5 text-[#8caaee]" />
          <span>Profile</span>
        </Link>

        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-[#8caaee]" />
          <span>Account dashboard</span>
        </Link>

        {onOpenBookmarks ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBookmarks();
            }}
            className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#fab387]" />
            <span>Bookmarks</span>
          </button>
        ) : (
          <Link
            href="/account#bookmarks"
            onClick={onClose}
            className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#fab387]" />
            <span>Bookmarks</span>
          </Link>
        )}

        <Link
          href="/account#progress"
          onClick={onClose}
          className="flex items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
        >
          <Compass className="h-3.5 w-3.5 text-[#a6e3a1]" />
          <span>Reading progress</span>
        </Link>
      </div>

      <div className="border-t border-[#414559]/60 my-0.5" />

      {/* Logout */}
      <div className="py-1">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#e78284] transition-colors hover:bg-[#e78284]/10 focus:outline-none disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface UserNavProps {
  compact?: boolean;
}

export function UserNav({ compact = false }: UserNavProps) {
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      return;
    }

    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#303446] animate-pulse">
        <span className="sr-only">Loading user...</span>
      </div>
    );
  }

  const returnPath = pathname || "/";
  const loginUrl = `/login?next=${encodeURIComponent(returnPath)}`;

  if (!user) {
    return (
      <Link
        href={loginUrl}
        className={`inline-flex items-center space-x-1.5 rounded-md border border-[#51576d] bg-[#303446] text-[#c6d0f5] hover:border-[#8caaee] hover:bg-[#414559] hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-[#8caaee] ${
          compact
            ? "p-1.5 sm:px-2.5 sm:py-1 text-[11px] font-mono"
            : "px-3 py-1.5 text-xs font-mono font-medium tracking-wide"
        }`}
        title="Sign in with Discord"
      >
        <LogIn className="h-3.5 w-3.5 text-[#8caaee]" />
        <span className={compact ? "hidden sm:inline" : ""}>Login</span>
      </Link>
    );
  }

  const { displayName, avatarUrl } = extractUserIdentity(user);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="group flex items-center space-x-2 rounded-full p-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#8caaee]"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        title={`Account: ${displayName}`}
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#51576d] bg-[#303446] transition-transform group-hover:scale-105">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#414559] text-xs font-mono text-[#8caaee]">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-[#414559] bg-[#303446] p-1.5 shadow-xl backdrop-blur-md ring-1 ring-black/20 focus:outline-none">
          <AccountMenuContent
            user={user}
            loginUrl={loginUrl}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
