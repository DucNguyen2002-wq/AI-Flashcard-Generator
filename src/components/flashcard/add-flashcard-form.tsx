"use client"

import { useState, useTransition, useRef } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createFlashcard } from "@/actions/flashcard.actions"

interface AddFlashcardFormProps {
  deckId: string
}

export function AddFlashcardForm({ deckId }: AddFlashcardFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("deckId", deckId)

    startTransition(async () => {
      const result = await createFlashcard(formData)
      if (result.success) {
        toast.success("Thêm flashcard thành công!")
        formRef.current?.reset()
        setOpen(false)
      } else {
        toast.error(result.error ?? "Thêm flashcard thất bại")
      }
    })
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Thêm thẻ thủ công
      </Button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Thêm flashcard mới</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="question">Câu hỏi *</Label>
          <Textarea
            id="question"
            name="question"
            placeholder="Nhập câu hỏi..."
            rows={2}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="answer">Câu trả lời *</Label>
          <Textarea
            id="answer"
            name="answer"
            placeholder="Nhập câu trả lời..."
            rows={2}
            required
            disabled={isPending}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Đang thêm..." : "Thêm thẻ"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Huỷ
          </Button>
        </div>
      </form>
    </div>
  )
}
