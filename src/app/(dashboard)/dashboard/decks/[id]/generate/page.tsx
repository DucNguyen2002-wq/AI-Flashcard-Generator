import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Deck } from "@/types"
import { GenerateForm } from "@/components/flashcard/generate-form"

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: deckData } = await supabase
    .from("decks")
    .select("id, title, description")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!deckData) notFound()

  const deck = deckData as unknown as Pick<Deck, "id" | "title" | "description">

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/dashboard/decks/${id}`}
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Sinh Flashcard AI</h2>
          </div>
          <p className="text-muted-foreground">
            Bộ thẻ: <span className="font-medium text-foreground">{deck.title}</span>
          </p>
        </div>
      </div>

      <GenerateForm deckId={id} />
    </div>
  )
}
