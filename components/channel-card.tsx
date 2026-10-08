"use client"

import { Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Channel } from "@/types/channel"

interface ChannelCardProps {
  channel: Channel
  onSelect: (channel: Channel) => void
}

export function ChannelCard({ channel, onSelect }: ChannelCardProps) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      onClick={() => onSelect(channel)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-muted/80 to-muted/40">
          <div className="flex h-full items-center justify-center p-4">
            <img
              src={channel.img}
              alt={channel.nome}
              className="h-full max-h-12 w-auto object-contain opacity-90 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.nome)}&background=1a1a2e&color=fff&size=128`
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <div className="absolute right-1.5 top-1.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            AO VIVO
          </div>
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {channel.nome}
          </h3>
        </div>
      </CardContent>
    </Card>
  )
}
