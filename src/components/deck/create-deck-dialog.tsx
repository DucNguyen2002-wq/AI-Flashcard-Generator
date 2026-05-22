"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDeck } from "@/actions/deck.actions";

export function CreateDeckDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDeck(formData);
      if (result.success) {
        toast.success("Tạo bộ thẻ thành công!");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Tạo bộ thẻ thất bại");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
        <Plus className="mr-2 h-4 w-4" />
        Tạo bộ thẻ mới
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên bộ thẻ *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ví dụ: Từ vựng Tiếng Anh"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Mô tả ngắn về bộ thẻ này..."
              rows={3}
              disabled={isPending}
            />
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang tạo..." : "Tạo bộ thẻ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
