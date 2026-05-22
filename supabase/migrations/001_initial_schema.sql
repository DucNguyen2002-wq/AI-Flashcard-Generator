-- ============================================================
-- Migration: 001_initial_schema
-- Creates: decks, flashcards, card_progress tables + RLS
-- ============================================================

-- ─── Trigger function: auto-update updated_at ───────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Table: decks ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL CHECK (char_length(title) <= 100),
  description TEXT,
  source_file TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER decks_updated_at
  BEFORE UPDATE ON decks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Table: flashcards ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS flashcards (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id    UUID        NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: card_progress ───────────────────────────────────
CREATE TABLE IF NOT EXISTS card_progress (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id     UUID        NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor      FLOAT       NOT NULL DEFAULT 2.5,
  interval_days    INT         NOT NULL DEFAULT 1,
  repetitions      INT         NOT NULL DEFAULT 0,
  next_review_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE (user_id, flashcard_id)
);

-- ─── Enable Row Level Security ───────────────────────────────
ALTER TABLE decks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards   ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: decks ────────────────────────────────────
CREATE POLICY "Users can manage their own decks"
  ON decks
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── RLS Policies: flashcards ───────────────────────────────
CREATE POLICY "Users can manage flashcards in their decks"
  ON flashcards
  FOR ALL
  USING (
    deck_id IN (
      SELECT id FROM decks WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    deck_id IN (
      SELECT id FROM decks WHERE user_id = auth.uid()
    )
  );

-- ─── RLS Policies: card_progress ────────────────────────────
CREATE POLICY "Users can manage their own card progress"
  ON card_progress
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
