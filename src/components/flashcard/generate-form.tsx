"use client"

import { useState, useRef, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2, CheckSquare, Square, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { saveGeneratedCards, uploadDocument } from "@/actions/flashcard.actions"
import type { GeneratedCard } from "@/types"

interface GenerateFormProps {
  deckId: string
}

const COUNT_OPTIONS = [5, 10, 15, 20] as const

export function GenerateForm({ deckId }: GenerateFormProps) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [count, setCount] = useState<5 | 10 | 15 | 20>(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, startSaveTransition] = useTransition()
  const [cards, setCards] = useState<GeneratedCard[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const charCount = text.length
  const isOverLimit = charCount > 5000

  // ── File handling ─────────────────────────────────────────
  function handleFileChange(selected: File | null) {
    if (!selected) return
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File không được vượt quá 5MB")
      return
    }
    if (!["application/pdf", "text/plain"].includes(selected.type)) {
      toast.error("Chỉ hỗ trợ file PDF hoặc TXT")
      return
    }
    setFile(selected)
  }

  async function handleExtract() {
    if (!file) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("deckId", deckId)
      const result = await uploadDocument(fd)
      if (result.success && result.text) {
        setText(result.text.slice(0, 5000))
        toast.success("Đọc file thành công!")
      } else {
        toast.error((result as { error?: string }).error ?? "Không thể đọc file")
      }
    } finally {
      setIsUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileChange(dropped)
  }

  // ── Generate ──────────────────────────────────────────────
  async function handleGenerate() {
    if (!text.trim() || isOverLimit) return
    setIsGenerating(true)
    setCards([])
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count, deckId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Sinh flashcard thất bại")
        return
      }
      const generated: GeneratedCard[] = data.map(
        (c: { question: string; answer: string }) => ({ ...c, selected: true })
      )
      setCards(generated)
    } catch {
      toast.error("Không thể kết nối đến server")
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Select all / deselect ─────────────────────────────────
  const allSelected = cards.every((c) => c.selected)
  function toggleAll() {
    setCards((prev) => prev.map((c) => ({ ...c, selected: !allSelected })))
  }
  function toggleCard(idx: number) {
    setCards((prev) => prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)))
  }

  // ── Save ──────────────────────────────────────────────────
  const selectedCards = cards.filter((c) => c.selected)
  function handleSave() {
    if (selectedCards.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thẻ")
      return
    }
    startSaveTransition(async () => {
      const result = await saveGeneratedCards(deckId, selectedCards)
      if (result.success) {
        toast.success(`Đã lưu ${result.count} thẻ vào bộ thẻ!`)
        router.push(`/dashboard/decks/${deckId}`)
      } else {
        toast.error((result as { error?: string }).error ?? "Lưu thất bại")
      }
    })
  }

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger value="text">Nhập văn bản</TabsTrigger>
          <TabsTrigger value="file">Upload file</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Text input ── */}
        <TabsContent value="text" className="mt-4 space-y-2">
          <div className="relative">
            <Textarea
              placeholder="Nhập nội dung bài học, đoạn văn bản, ghi chú..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className={isOverLimit ? "border-destructive focus-visible:ring-destructive" : ""}
              disabled={isGenerating}
            />
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                charCount > 4500 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {charCount.toLocaleString()} / 5.000 ký tự
            </span>
          </div>
        </TabsContent>

        {/* ── Tab 2: File upload ── */}
        <TabsContent value="file" className="mt-4 space-y-4">
          {!file ? (
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 py-12 transition-colors hover:border-muted-foreground/60 hover:bg-muted/30"
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Kéo thả file PDF hoặc TXT vào đây</p>
                <p className="text-xs text-muted-foreground">hoặc nhấn để chọn file (tối đa 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <div className="ml-4 flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={handleExtract}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Đang đọc...</>
                  ) : (
                    "Đọc file"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Count select ── */}
      <div className="space-y-2">
        <Label>Số lượng thẻ muốn sinh</Label>
        <div className="flex gap-2">
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                count === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* ── Generate button ── */}
      <Button
        onClick={handleGenerate}
        disabled={!text.trim() || isOverLimit || isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang phân tích nội dung... (có thể mất vài giây)
          </>
        ) : (
          "Sinh Flashcard"
        )}
      </Button>

      {/* ── Preview results ── */}
      {cards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Xem trước {cards.length} flashcard được sinh
            </h3>
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={toggleAll}
            >
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  card.selected
                    ? "border-primary/50 bg-primary/5"
                    : "opacity-50 hover:opacity-70"
                }`}
                onClick={() => toggleCard(idx)}
              >
                <div className="mb-1 flex items-center gap-2">
                  {card.selected ? (
                    <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-medium text-muted-foreground">Thẻ {idx + 1}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Câu hỏi</p>
                    <p className="text-sm">{card.question}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Câu trả lời</p>
                    <p className="text-sm text-muted-foreground">{card.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={selectedCards.length === 0 || isSaving}
            className="w-full"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Lưu {selectedCards.length} thẻ đã chọn vào bộ thẻ</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
