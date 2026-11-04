export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  chapter_id: string;
  chapter_number: number | null;
  chapter_title: string | null;
  scroll_position: number;
  progress_updated_at: string;
  created_at: string;
  version: number;
}

export interface DatabaseBookmark {
  id: string;
  user_id: string;
  chapter_id: string;
  chapter_number: number | null;
  chapter_title: string | null;
  created_at: string;
}

export type ReactionType = "love" | "funny" | "shock" | "sad" | "fire";

export type CommentSortOrder = "top" | "newest" | "oldest";

export type CommentReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "spoiler"
  | "other";

export interface DatabaseChapterLike {
  id: string;
  chapter_id: string;
  user_id: string;
  created_at: string;
}

export interface DatabaseComment {
  id: string;
  chapter_id: string;
  user_id?: string;
  parent_id: string | null;
  content: string;
  is_spoiler: boolean;
  is_deleted: boolean;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface DatabaseCommentReport {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: CommentReportReason;
  details: string | null;
  created_at: string;
}

export interface DatabaseChapterReaction {
  id: string;
  chapter_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  updated_at: string;
}

export interface ChapterSocialSummaryRow {
  chapter_id: string;
  like_count: number;
  comment_count: number;
  reaction_counts: Partial<Record<ReactionType, number>> | null;
  viewer_liked: boolean;
  viewer_reaction: ReactionType | null;
}

export interface CommentRow {
  id: string;
  chapter_id: string;
  parent_id: string | null;
  content: string;
  is_spoiler: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  reply_count: number;
  author_username: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  viewer_liked: boolean;
  is_own: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      reading_progress: {
        Row: ReadingProgress;
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          chapter_number?: number | null;
          chapter_title?: string | null;
          scroll_position?: number;
          progress_updated_at?: string;
          created_at?: string;
          version?: number;
        };
        Update: Partial<ReadingProgress>;
        Relationships: [];
      };
      bookmarks: {
        Row: DatabaseBookmark;
        Insert: {
          id?: string;
          user_id: string;
          chapter_id: string;
          chapter_number?: number | null;
          chapter_title?: string | null;
          created_at?: string;
        };
        Update: Partial<DatabaseBookmark>;
        Relationships: [];
      };
      chapter_likes: {
        Row: DatabaseChapterLike;
        Insert: {
          chapter_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      comments: {
        Row: DatabaseComment;
        Insert: {
          chapter_id: string;
          parent_id?: string | null;
          content: string;
          is_spoiler?: boolean;
        };
        Update: {
          content?: string;
          is_spoiler?: boolean;
          is_deleted?: boolean;
        };
        Relationships: [];
      };
      comment_likes: {
        Row: DatabaseCommentLike;
        Insert: {
          comment_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      comment_reports: {
        Row: DatabaseCommentReport;
        Insert: {
          comment_id: string;
          reason: CommentReportReason;
          details?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      chapter_reactions: {
        Row: DatabaseChapterReaction;
        Insert: {
          chapter_id: string;
          reaction_type: ReactionType;
        };
        Update: {
          reaction_type: ReactionType;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sync_reading_progress: {
        Args: {
          p_expected_user_id: string;
          p_expected_version: number;
          p_chapter_id: string;
          p_chapter_number: number;
          p_chapter_title: string;
          p_scroll_position: number;
        };
        Returns: {
          id: string;
          user_id: string;
          chapter_id: string;
          chapter_number: number;
          chapter_title: string;
          scroll_position: number;
          progress_updated_at: string;
          version: number;
          updated: boolean;
          record_exists: boolean;
        }[];
      };
      get_chapter_social: {
        Args: {
          p_chapter_id: string;
        };
        Returns: ChapterSocialSummaryRow[];
      };
      get_chapter_comments: {
        Args: {
          p_chapter_id: string;
          p_sort?: CommentSortOrder;
          p_limit?: number;
          p_cursor_like_count?: number | null;
          p_cursor_created_at?: string | null;
          p_cursor_id?: string | null;
        };
        Returns: CommentRow[];
      };
      get_comment_replies: {
        Args: {
          p_parent_id: string;
          p_limit?: number;
          p_cursor_created_at?: string | null;
          p_cursor_id?: string | null;
        };
        Returns: CommentRow[];
      };
      set_chapter_reaction: {
        Args: {
          p_chapter_id: string;
          p_reaction_type: ReactionType | null;
        };
        Returns: ReactionType | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
