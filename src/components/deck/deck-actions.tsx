"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateDeck, deleteDeck } from "@/actions/deck.actions";
import type { DeckWithCount } from "@/types";

interface DeckActionsProps {
  deck: DeckWithCount;
}

export function DeckActions({ deck }: DeckActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateDeck(deck.id, formData);
      if (result.success) {
        toast.success("Cập nhật bộ thẻ thành công!");
        setEditOpen(false);
      } else {
        toast.error(result.error ?? "Cập nhật thất bại");
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteDeck(deck.id);
      if (result.success) {
        toast.success("Đã xoá bộ thẻ");
        setDeleteOpen(false);
        router.push("/dashboard/decks");
      } else {
        toast.error(result.error ?? "Xoá thất bại");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm ring-1 ring-foreground/10 transition-colors hover:bg-muted hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Tuỳ chọn</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bộ thẻ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Tên bộ thẻ *</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={deck.title}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={deck.description ?? ""}
                rows={3}
                disabled={isPending}
              />
            </div>
            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá bộ thẻ</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xoá bộ thẻ <strong>"{deck.title}"</strong>? Thao
            tác này sẽ xoá tất cả flashcard và lịch sử học liên quan và không
            thể hoàn tác.
          </p>
          <DialogFooter showCloseButton>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Đang xoá..." : "Xoá bộ thẻ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
