// Supabase DB 스키마 타입 — docs/DATA_MODEL.md 기준 수기 정의.
// (supabase gen types 도입 전 임시. 스키마 변경 시 함께 갱신할 것.)

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          image_path: string
          color: string
          style_tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          image_path: string
          color: string
          style_tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          image_path?: string
          color?: string
          style_tags?: string[]
          created_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          date: string
          mood: string | null
          weather: string | null
          memo: string | null
          item_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood?: string | null
          weather?: string | null
          memo?: string | null
          item_ids?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood?: string | null
          weather?: string | null
          memo?: string | null
          item_ids?: string[]
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
