import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { AccountView } from "@/components/account/AccountView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Cultivator Account — Reverend Reader",
  description: "View and manage your Reverend Insanity reading progress, saved bookmarks, and cultivator profile.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  // 1. Fetch profile with error tolerance
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 2. Fetch current reading progress
  const { data: progress } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Fetch bookmarks
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-[#292c3c] text-[#c6d0f5] selection:bg-[#8caaee]/30">
      <Navigation />

      <main className="flex-1 py-6 sm:py-10">
        <AccountView
          user={user}
          profile={profile}
          initialProgress={progress}
          initialBookmarks={bookmarks || []}
        />
      </main>

      <Footer />
    </div>
  );
}
