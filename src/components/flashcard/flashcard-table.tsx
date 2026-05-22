"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Pencil, Trash2, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateFlashcard, deleteFlashcard } from "@/actions/flashcard.actions"
import type { Flashcard } from "@/types"

interface FlashcardTableProps {
  flashcards: Flashcard[]
  deckId: string
}

export function FlashcardTable({ flashcards, deckId }: FlashcardTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(card: Flashcard) {
    setEditingId(card.id)
    setEditQuestion(card.question)
    setEditAnswer(card.answer)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditQuestion("")
    setEditAnswer("")
  }

  function handleUpdate(id: string) {
    const formData = new FormData()
    formData.set("question", editQuestion)
    formData.set("answer", editAnswer)
    startTransition(async () => {
      const result = await updateFlashcard(id, formData)
      if (result.success) {
        toast.success("Cập nhật flashcard thành công!")
        cancelEdit()
      } else {
        toast.error(result.error ?? "Cập nhật thất bại")
      }
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteFlashcard(id, deckId)
      if (result.success) {
        toast.success("Đã xoá flashcard")
      } else {
        toast.error(result.error ?? "Xoá thất bại")
      }
      setDeletingId(null)
    })
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center gap-2">
        <p className="font-medium">Bộ thẻ này chưa có thẻ nào</p>
        <p className="text-sm text-muted-foreground">
          Thêm thủ công hoặc sinh bằng AI ở phía trên
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Câu hỏi</TableHead>
            <TableHead>Câu trả lời</TableHead>
            <TableHead className="w-28">Ngày tạo</TableHead>
            <TableHead className="w-20 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcards.map((card, idx) => (
            <TableRow key={card.id}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              {editingId === card.id ? (
                <>
                  <TableCell>
                    <Textarea
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      rows={2}
                      className="text-sm"
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      rows={2}
                      className="text-sm"
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell />
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdate(card.id)}
                        disabled={isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={cancelEdit}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-sm">{card.question}</p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-sm text-muted-foreground">{card.answer}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(card.created_at), "dd/MM/yyyy", { locale: vi })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => startEdit(card)}
                        disabled={isPending}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(card.id)}
                        disabled={isPending || deletingId === card.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
