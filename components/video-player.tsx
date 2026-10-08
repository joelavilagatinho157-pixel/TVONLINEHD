"use client"

import { useState } from "react"
import { X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Channel } from "@/types/channel"

interface VideoPlayerProps {
  channel: Channel
  onClose: () => void
}

export function VideoPlayer({ channel, onClose }: VideoPlayerProps) {
  const streams = [
    channel.url,
    channel.stream2,
    channel.stream3,
    channel.stream4,
  ].filter((s) => s && s.trim() !== "")

  const [currentStreamIndex, setCurrentStreamIndex] = useState(0)

  const handleNextStream = () => {
    if (streams.length > 1) {
      setCurrentStreamIndex((prev) => (prev + 1) % streams.length)
    }
  }

  const currentStream = streams[currentStreamIndex]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/10">
            <img
              src={channel.img}
              alt={channel.nome}
              className="h-6 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.nome)}&background=random`
              }}
            />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{channel.nome}</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-white/60">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                AO VIVO
              </span>
              {streams.length > 1 && (
                <span className="text-xs text-white/40">
                  Stream {currentStreamIndex + 1}/{streams.length}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streams.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextStream}
              className="text-white/70 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Trocar Stream
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar player</span>
          </Button>
        </div>
      </div>

      {/* Player */}
      <div className="flex flex-1 items-center justify-center bg-black">
        <iframe
          key={currentStream}
          src={currentStream}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  )
}
