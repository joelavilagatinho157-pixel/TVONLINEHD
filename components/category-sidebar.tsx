"use client"

import { cn } from "@/lib/utils"
import { Tv, Trophy, Newspaper, Baby, Globe } from "lucide-react"

interface CategoryInfo {
  id: string
  name: string
  count: number
}

const iconMap: Record<string, React.ElementType> = {
  "TV Aberta": Tv,
  Esportes: Trophy,
  Noticias: Newspaper,
  Infantil: Baby,
  Documentarios: Globe,
}

interface CategorySidebarProps {
  categories: CategoryInfo[]
  activeCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function CategorySidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-card/50 p-4 md:block">
      <div className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categorias
        </h2>
      </div>
      <nav className="space-y-1">
        {categories.map((category) => {
          const Icon = iconMap[category.name] || Tv
          const isActive =
            activeCategory.toLowerCase() === category.id.toLowerCase()
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{category.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {category.count}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
