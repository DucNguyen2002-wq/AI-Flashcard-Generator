import type { SM2Grade, SM2Result } from "@/types"

interface SM2Input {
  grade: SM2Grade
  easeFactor: number
  intervalDays: number
  repetitions: number
}

/**
 * Implements the SM-2 spaced repetition algorithm.
 * https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */
export function calculateSM2({
  grade,
  easeFactor,
  intervalDays,
  repetitions,
}: SM2Input): SM2Result {
  let newEaseFactor = easeFactor
  let newIntervalDays: number
  let newRepetitions: number

  // Update ease factor (clamp to minimum 1.3)
  newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (4 - grade) * (0.08 + (4 - grade) * 0.02)
  )

  if (grade < 3) {
    // Incorrect or hard: reset
    newRepetitions = 0
    newIntervalDays = 1
  } else {
    // Correct: advance
    if (repetitions === 0) {
      newIntervalDays = 1
    } else if (repetitions === 1) {
      newIntervalDays = 6
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor)
    }
    newRepetitions = repetitions + 1
  }

  const nextReviewAt = new Date(Date.now() + newIntervalDays * 24 * 60 * 60 * 1000)

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}

/** Default values for a card that has never been studied */
export const SM2_DEFAULTS = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
}
