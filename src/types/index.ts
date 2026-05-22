// ============================================================
// Database type definitions (manual, matching Supabase schema)
// ============================================================

export type Database = {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          source_file: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          source_file?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          source_file?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          deck_id: string
          question: string
          answer: string
          created_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          question: string
          answer: string
          created_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          question?: string
          answer?: string
          created_at?: string
        }
      }
      card_progress: {
        Row: {
          id: string
          user_id: string
          flashcard_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_at: string
          last_reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          flashcard_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          last_reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          flashcard_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          last_reviewed_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ─── Row types ───────────────────────────────────────────────
export type Deck = Database['public']['Tables']['decks']['Row']
export type Flashcard = Database['public']['Tables']['flashcards']['Row']
export type CardProgress = Database['public']['Tables']['card_progress']['Row']

// ─── Extended types ──────────────────────────────────────────
export type DeckWithCount = Deck & {
  flashcard_count: number
  due_count: number
}

export type StudyCard = Flashcard & {
  progress: CardProgress | null
}

export type GeneratedCard = {
  question: string
  answer: string
  selected: boolean
}

// ─── SM-2 Algorithm types ────────────────────────────────────
export type SM2Grade = 1 | 2 | 3 | 4

export type SM2Result = {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: Date
}
