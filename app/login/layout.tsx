import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Optional Discord sign-in to sync your Reverend Insanity reading progress and bookmarks.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
