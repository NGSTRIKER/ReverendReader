"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogIn, LogOut, User as UserIcon, Loader2, UserCheck } from "lucide-react";

interface UserNavProps {
  compact?: boolean;
}

export function UserNav({ compact = false }: UserNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch current active session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 2. Subscribe to auth changes (login, logout, token refresh)
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

  // Close dropdown on outside click or Escape key
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

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsDropdownOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading skeleton placeholder
  if (loading) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#303446] animate-pulse">
        <span className="sr-only">Loading user...</span>
      </div>
    );
  }

  // Current page return path for seamless return after login
  const returnPath = pathname || "/";
  const loginUrl = `/login?next=${encodeURIComponent(returnPath)}`;

  // Logged OUT: Login button
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

  // Logged IN: User avatar + dropdown
  const metadata = user.user_metadata || {};
  const displayName =
    metadata.full_name ||
    metadata.custom_claims?.global_name ||
    metadata.name ||
    metadata.preferred_username ||
    user.email?.split("@")[0] ||
    "Cultivator";

  const username = metadata.preferred_username || metadata.user_name || user.email;
  const avatarUrl = metadata.avatar_url || metadata.picture;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
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

      {/* Account Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-[#414559] bg-[#303446] p-1.5 shadow-xl backdrop-blur-md ring-1 ring-black/20 focus:outline-none">
          {/* User Info Header */}
          <div className="border-b border-[#414559] px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-[#c6d0f5]">{displayName}</p>
            {username && (
              <p className="truncate font-mono text-[10px] text-[#a5adce]">
                @{username.replace(/^@/, "")}
              </p>
            )}
            <div className="mt-1 flex items-center space-x-1 font-mono text-[9px] uppercase tracking-wider text-[#a6d189]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
              <span>Discord Connected</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/account"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#8caaee]" />
              <span>Account & Library</span>
            </Link>
          </div>

          <div className="border-t border-[#414559]/60 my-0.5" />

          {/* Action List */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#e78284] transition-colors hover:bg-[#e78284]/10 focus:outline-none disabled:opacity-50"
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
      )}
    </div>
  );
}
