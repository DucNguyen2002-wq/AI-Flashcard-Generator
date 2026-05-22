"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { calculateSM2, SM2_DEFAULTS } from "@/lib/sm2"
import type { SM2Grade, StudyCard, Flashcard, CardProgress } from "@/types"

export async function updateCardProgress(
  flashcardId: string,
  grade: SM2Grade
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Chưa xác thực" }
  }

  // Get existing progress
  const { data: existing } = await supabase
    .from("card_progress")
    .select("*")
    .eq("flashcard_id", flashcardId)
    .eq("user_id", user.id)
    .single()

  const current = existing as unknown as CardProgress | null

  const result = calculateSM2({
    grade,
    easeFactor: current?.ease_factor ?? SM2_DEFAULTS.easeFactor,
    intervalDays: current?.interval_days ?? SM2_DEFAULTS.intervalDays,
    repetitions: current?.repetitions ?? SM2_DEFAULTS.repetitions,
  })

  const { error } = await supabase.from("card_progress").upsert({
    flashcard_id: flashcardId,
    user_id: user.id,
    ease_factor: result.easeFactor,
    interval_days: result.intervalDays,
    repetitions: result.repetitions,
    next_review_at: result.nextReviewAt.toISOString(),
    last_reviewed_at: new Date().toISOString(),
  }, {
    onConflict: "flashcard_id,user_id",
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getStudyCards(deckId: string): Promise<StudyCard[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return []

  // Verify deck ownership
  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single()

  if (!deck) return []

  // Get all flashcards in the deck
  const { data: flashcardsData } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", deckId)
    .order("created_at", { ascending: true })

  if (!flashcardsData || (flashcardsData as unknown[]).length === 0) return []

  const flashcards = (flashcardsData as unknown[]) as Flashcard[]

  // Get progress for user
  const { data: progressData } = await supabase
    .from("card_progress")
    .select("*")
    .eq("user_id", user.id)
    .in(
      "flashcard_id",
      flashcards.map((f) => f.id)
    )

  const progressMap = new Map<string, CardProgress>()
  for (const p of (progressData as unknown[]) ?? []) {
    const prog = p as CardProgress
    progressMap.set(prog.flashcard_id, prog)
  }

  const now = new Date()

  // Include cards with no progress OR where next_review_at <= now
  const dueCards: StudyCard[] = flashcards
    .filter((f) => {
      const prog = progressMap.get(f.id)
      if (!prog) return true // Never studied
      return new Date(prog.next_review_at) <= now
    })
    .map((f) => ({
      ...f,
      progress: progressMap.get(f.id) ?? null,
    }))

  // Shuffle and limit to 50
  const shuffled = dueCards.sort(() => Math.random() - 0.5).slice(0, 50)
  return shuffled
}
