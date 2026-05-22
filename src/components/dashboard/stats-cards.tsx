import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Clock, Flame } from "lucide-react"

interface StatsCardsProps {
  totalDecks: number
  totalFlashcards: number
  dueToday: number
  streak: number
}

export function StatsCards({
  totalDecks,
  totalFlashcards,
  dueToday,
  streak,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Tổng bộ thẻ",
      value: totalDecks,
      icon: BookOpen,
      description: "Bộ thẻ đã tạo",
      color: "text-blue-500",
    },
    {
      title: "Tổng thẻ ghi nhớ",
      value: totalFlashcards,
      icon: Brain,
      description: "Thẻ trong tất cả bộ",
      color: "text-violet-500",
    },
    {
      title: "Đến hạn hôm nay",
      value: dueToday,
      icon: Clock,
      description: "Thẻ cần ôn tập",
      color: "text-amber-500",
    },
    {
      title: "Chuỗi ngày học",
      value: streak,
      icon: Flame,
      description: "Ngày liên tiếp",
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
