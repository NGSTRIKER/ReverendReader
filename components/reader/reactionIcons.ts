import { Flame, Frown, Heart, Laugh, Zap, type LucideIcon } from "lucide-react";
import type { ReactionType } from "@/lib/supabase/social";

export const REACTION_ICONS: Record<ReactionType, LucideIcon> = {
  love: Heart,
  funny: Laugh,
  shock: Zap,
  sad: Frown,
  fire: Flame,
};
