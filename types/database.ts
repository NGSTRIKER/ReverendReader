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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
