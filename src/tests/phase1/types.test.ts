import { describe, it, expect } from "vitest";
import type {
  Deck,
  Flashcard,
  CardProgress,
  DeckWithCount,
  StudyCard,
  GeneratedCard,
  SM2Grade,
  SM2Result,
} from "@/types";

describe("TypeScript type definitions (Phase 1)", () => {
  it("Deck type has required fields", () => {
    const deck: Deck = {
      id: "uuid-1",
      user_id: "user-1",
      title: "Test Deck",
      description: null,
      source_file: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(deck.id).toBe("uuid-1");
    expect(deck.title).toBe("Test Deck");
    expect(deck.description).toBeNull();
  });

  it("Flashcard type has required fields", () => {
    const card: Flashcard = {
      id: "card-1",
      deck_id: "uuid-1",
      question: "What is React?",
      answer: "A JavaScript library for building UIs",
      created_at: new Date().toISOString(),
    };
    expect(card.question).toBeTruthy();
    expect(card.answer).toBeTruthy();
  });

  it("CardProgress type has SM-2 algorithm fields", () => {
    const progress: CardProgress = {
      id: "prog-1",
      user_id: "user-1",
      flashcard_id: "card-1",
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 0,
      next_review_at: new Date().toISOString(),
      last_reviewed_at: null,
    };
    expect(progress.ease_factor).toBe(2.5);
    expect(progress.interval_days).toBe(1);
  });

  it("DeckWithCount extends Deck with count fields", () => {
    const deck: DeckWithCount = {
      id: "uuid-1",
      user_id: "user-1",
      title: "Test Deck",
      description: null,
      source_file: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flashcard_count: 10,
      due_count: 3,
    };
    expect(deck.flashcard_count).toBe(10);
    expect(deck.due_count).toBe(3);
  });

  it("StudyCard combines Flashcard with optional progress", () => {
    const studyCard: StudyCard = {
      id: "card-1",
      deck_id: "uuid-1",
      question: "Q",
      answer: "A",
      created_at: new Date().toISOString(),
      progress: null,
    };
    expect(studyCard.progress).toBeNull();
  });

  it("GeneratedCard has selected flag", () => {
    const card: GeneratedCard = {
      question: "AI question",
      answer: "AI answer",
      selected: true,
    };
    expect(card.selected).toBe(true);
  });

  it("SM2Grade is only 1-4", () => {
    const grades: SM2Grade[] = [1, 2, 3, 4];
    expect(grades).toHaveLength(4);
    grades.forEach((g) => expect(g).toBeGreaterThanOrEqual(1));
    grades.forEach((g) => expect(g).toBeLessThanOrEqual(4));
  });

  it("SM2Result has all algorithm output fields", () => {
    const result: SM2Result = {
      easeFactor: 2.5,
      intervalDays: 6,
      repetitions: 1,
      nextReviewAt: new Date(),
    };
    expect(result.nextReviewAt).toBeInstanceOf(Date);
  });
});
