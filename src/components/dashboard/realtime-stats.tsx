"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface RealtimeStatsProps {
  userId: string;
  onUpdate?: () => void;
}

export function RealtimeStats({ userId, onUpdate }: RealtimeStatsProps) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("card_progress_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "card_progress",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          toast.success("✓ Đã đồng bộ");
          onUpdateRef.current?.();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
