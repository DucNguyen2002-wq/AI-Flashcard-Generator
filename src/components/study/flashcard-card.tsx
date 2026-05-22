"use client";

import type { StudyCard } from "@/types";

interface FlashcardCardProps {
  card: StudyCard;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({ card, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div
      className="relative h-64 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={onFlip}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-8 shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
            CÂU HỎI
          </span>
          <p className="text-center text-lg font-medium leading-relaxed">
            {card.question}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-8 shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="mb-4 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 uppercase tracking-wide">
            TRẢ LỜI
          </span>
          <p className="text-center text-lg font-medium leading-relaxed">
            {card.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
