import Link from "next/link";
import { LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoCardsStateProps {
  deckId: string;
}

export function NoCardsState({ deckId }: NoCardsStateProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <LayersIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold">Bộ thẻ này chưa có thẻ nào</h2>
      <p className="text-muted-foreground">
        Thêm thẻ thủ công hoặc dùng AI để sinh thẻ tự động.
      </p>
      <Link href={`/dashboard/decks/${deckId}`}>
        <Button variant="outline">Quay về bộ thẻ</Button>
      </Link>
    </div>
  );
}
