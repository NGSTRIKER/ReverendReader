import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { AccountView } from "@/components/account/AccountView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reader Account",
  description:
    "View and manage your Reverend Insanity reading progress, saved bookmarks, and reader profile.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: progress } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Navigation />

      <main className="flex-1 py-8 sm:py-12">
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
