"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { StudyCard, SM2Grade } from "@/types"
import { updateCardProgress } from "@/actions/progress.actions"
import { FlashcardCard } from "./flashcard-card"
import { SessionComplete } from "./session-complete"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface StudySessionProps {
  cards: StudyCard[]
  deckId: string
  deckTitle: string
}

const GRADE_LABELS: { grade: SM2Grade; label: string; color: string }[] = [
  { grade: 1, label: "Không nhớ", color: "bg-destructive hover:bg-destructive/90 text-destructive-foreground" },
  { grade: 2, label: "Khó nhớ", color: "bg-orange-500 hover:bg-orange-500/90 text-white" },
  { grade: 3, label: "Nhớ được", color: "bg-yellow-500 hover:bg-yellow-500/90 text-white" },
  { grade: 4, label: "Dễ dàng", color: "bg-green-500 hover:bg-green-500/90 text-white" },
]

export function StudySession({ cards, deckId, deckTitle }: StudySessionProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, startTime: Date.now() })
  const [isRating, setIsRating] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex) / cards.length) * 100

  function handleFlip() {
    setIsFlipped((f) => !f)
  }

  const handleRate = useCallback(
    async (grade: SM2Grade) => {
      if (!isFlipped || isRating) return
      setIsRating(true)

      // Update progress in background
      await updateCardProgress(currentCard.id, grade)

      setSessionStats((prev) => ({
        ...prev,
        correct: grade >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: grade < 3 ? prev.incorrect + 1 : prev.incorrect,
      }))

      // Short delay then advance
      setTimeout(() => {
        setIsFlipped(false)
        setIsRating(false)
        if (currentIndex + 1 >= cards.length) {
          setIsFinished(true)
        } else {
          setCurrentIndex((i) => i + 1)
        }
      }, 300)
    },
    [isFlipped, isRating, currentCard, currentIndex, cards.length]
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        if (!isFlipped) handleFlip()
      }
      if (isFlipped) {
        if (e.key === "1") handleRate(1)
        if (e.key === "2") handleRate(2)
        if (e.key === "3") handleRate(3)
        if (e.key === "4") handleRate(4)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isFlipped, handleRate])

  if (isFinished) {
    return (
      <SessionComplete
        correct={sessionStats.correct}
        total={cards.length}
        durationMs={Date.now() - sessionStats.startTime}
        deckId={deckId}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>{deckTitle}</span>
            <span>
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => router.push(`/dashboard/decks/${deckId}`)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Card */}
      <FlashcardCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />

      {/* Rating buttons */}
      {isFlipped ? (
        <div className="space-y-2">
          <p className="text-center text-sm text-muted-foreground">
            Bạn nhớ bài này như thế nào? (Phím tắt: 1-4)
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GRADE_LABELS.map(({ grade, label, color }) => (
              <button
                key={grade}
                type="button"
                disabled={isRating}
                onClick={() => handleRate(grade)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50 ${color}`}
              >
                <span className="block text-xs opacity-75 mb-0.5">{grade}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Nhấn vào thẻ hoặc phím{" "}
          <kbd className="rounded border px-1 py-0.5 text-xs font-mono">Space</kbd> để xem câu trả lời
        </p>
      )}
    </div>
  )
}
