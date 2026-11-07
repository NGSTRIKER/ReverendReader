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
  const rawDiscordUsername =
    metadata.preferred_username ||
    metadata.user_name ||
    metadata.custom_claims?.global_name ||
    metadata.name ||
    metadata.full_name ||
    user.email?.split("@")[0];

  const discordUsername = cleanPublicUsername(rawDiscordUsername) || "Cultivator";
  const avatarUrl = sanitizeAvatarUrl(metadata.avatar_url || metadata.picture);

  return {
    displayName: discordUsername,
    username: discordUsername,
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
        <div className="px-2.5 py-2 border-b border-line mb-2">
          <p className="text-xs font-semibold text-ink">Reader Account</p>
          <p className="mt-0.5 text-xs text-muted">
            Sign in to like chapters, join discussions, and sync progress.
          </p>
        </div>
        <Link
          href={loginUrl}
          onClick={onClose}
          className="btn-primary w-full py-2 text-xs font-medium"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Sign in with Discord</span>
        </Link>
      </div>
    );
  }

  const { displayName, username, avatarUrl } = extractUserIdentity(user);

  return (
    <div>
      {/* User Info Header */}
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-2.5">
        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-[3px] border border-line bg-sunken">
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
            <div className="flex h-full w-full items-center justify-center text-xs text-accent">
              <UserIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">{displayName}</p>
          {username && username.toLowerCase() !== displayName.toLowerCase() && (
            <p className="truncate text-[11px] text-muted">@{username}</p>
          )}
          <p className="text-[10px] text-muted">Discord connected</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        <Link
          href="/account#profile"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-ink hover:bg-sunken transition-colors"
        >
          <UserCheck className="h-3.5 w-3.5 text-accent" />
          <span>Profile</span>
        </Link>

        <Link
          href="/account"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-ink hover:bg-sunken transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5 text-accent" />
          <span>Account overview</span>
        </Link>

        {onOpenBookmarks ? (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBookmarks();
            }}
            className="flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-ink hover:bg-sunken transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5 text-accent" />
            <span>Bookmarks</span>
          </button>
        ) : (
          <Link
            href="/account#bookmarks"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-ink hover:bg-sunken transition-colors"
          >
            <Bookmark className="h-3.5 w-3.5 text-accent" />
            <span>Bookmarks</span>
          </Link>
        )}

        <Link
          href="/account#progress"
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-ink hover:bg-sunken transition-colors"
        >
          <Compass className="h-3.5 w-3.5 text-accent" />
          <span>Reading progress</span>
        </Link>
      </div>

      <div className="border-t border-line my-0.5" />

      {/* Logout */}
      <div className="py-1">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-xs text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
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
      <div className="flex items-center justify-center h-8 w-8 rounded-[3px] bg-sunken">
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
        className={`btn-quiet ${
          compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs"
        }`}
        title="Sign in with Discord"
      >
        <LogIn className="h-3.5 w-3.5 text-accent" />
        <span className={compact ? "hidden sm:inline" : ""}>Sign in</span>
      </Link>
    );
  }

  const { displayName, avatarUrl } = extractUserIdentity(user);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="group flex items-center gap-2 rounded-[3px] p-0.5"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        title={`Account: ${displayName}`}
      >
        <div className="relative h-7 w-7 overflow-hidden rounded-[3px] border border-line-strong bg-sunken">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-accent">
              <UserIcon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right border border-line bg-surface p-1.5 shadow-pop">
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
