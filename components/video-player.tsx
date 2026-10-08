"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Maximize, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Channel } from "@/types/channel"

type EpgItem = {
  title?: string
  desc?: string
  start_date?: string
}

type EpgResponse = Record<string, EpgItem[]> | Array<{ id: string; data: EpgItem[] }>

interface VideoPlayerProps {
  channel: Channel
  channels?: Channel[]
  onClose: () => void
  onChannelChange?: (channel: Channel) => void
}

const EPG_URL = "https://embedtv.lat/api/epg_all"

export function VideoPlayer({ channel, channels = [], onClose, onChannelChange }: VideoPlayerProps) {
  const streams = useMemo(
    () => [channel.url, channel.stream2, channel.stream3, channel.stream4].filter(Boolean),
    [channel],
  )
  const [streamIndex, setStreamIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<EpgItem[]>([])
  const [showEpg, setShowEpg] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setStreamIndex(0)
    setIsLoading(true)
    setPrograms([])
    setShowEpg(true)

    const loadEpg = async () => {
      try {
        const response = await fetch(EPG_URL, { cache: "no-store" })
        if (!response.ok) return
        const payload = (await response.json()) as EpgResponse
        const key = channel.nome.toLowerCase().replace(/[^a-z0-9]+/g, "")
        const data = Array.isArray(payload)
          ? payload.find((item) => item.id.toLowerCase() === key)?.data
          : Object.entries(payload).find(([id]) => id.toLowerCase() === key)?.[1]
        setPrograms(data ?? [])
      } catch {
        setPrograms([])
      }
    }

    void loadEpg()
    const hideTimer = window.setTimeout(() => setShowEpg(false), 5 * 60 * 1000)
    return () => window.clearTimeout(hideTimer)
  }, [channel])

  const now = Date.now()
  const current = [...programs]
    .filter((program) => program.start_date && new Date(program.start_date).getTime() <= now)
    .sort((a, b) => new Date(b.start_date!).getTime() - new Date(a.start_date!).getTime())[0]
  const next = [...programs]
    .filter((program) => program.start_date && new Date(program.start_date).getTime() > now)
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())[0]

  const channelIndex = channels.findIndex((item) => item.id === channel.id)
  const changeChannel = (offset: number) => {
    if (!onChannelChange || !channels.length || channelIndex < 0) return
    onChannelChange(channels[(channelIndex + offset + channels.length) % channels.length])
  }

  const toggleFullscreen = async () => {
    const player = document.querySelector(".player-shell")
    if (!document.fullscreenElement) await player?.requestFullscreen?.()
    else await document.exitFullscreen()
    setIsFullscreen(Boolean(document.fullscreenElement))
  }

  return (
    <div className="player-shell fixed inset-0 z-50 flex flex-col bg-black">
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-4 py-4">
        <div className="flex items-center gap-3">
          <img src={channel.img} alt="" className="h-9 w-9 rounded-md object-contain" />
          <div><h2 className="text-sm font-semibold text-white">{channel.nome}</h2><span className="text-[11px] text-white/60">AO VIVO</span></div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10"><X /><span className="sr-only">Fechar player</span></Button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        {isLoading && <div className="absolute z-[1] text-sm text-white/60">Carregando canal...</div>}
        <iframe key={streams[streamIndex]} src={streams[streamIndex]} title={`Player ao vivo: ${channel.nome}`} className="relative z-[2] h-full w-full border-0" loading="eager" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen onLoad={() => setIsLoading(false)} />

        {showEpg && (current || next) && <section className="absolute bottom-5 left-5 z-10 w-[min(360px,calc(100%-80px))] rounded-xl border border-white/15 bg-black/80 p-3 text-white shadow-2xl backdrop-blur-md" aria-label="Programação do canal">
          <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Programação</span><button onClick={() => setShowEpg(false)} className="text-xs text-white/50 hover:text-white">Ocultar</button></div>
          {current && <div className="border-l-2 border-cyan-400 pl-3"><p className="text-[10px] uppercase text-white/45">Agora</p><p className="truncate text-sm font-semibold">{current.title || "Programação atual"}</p></div>}
          {next && <div className="mt-2 border-l-2 border-white/25 pl-3"><p className="text-[10px] uppercase text-white/45">A seguir</p><p className="truncate text-sm text-white/80">{next.title || "Próximo programa"}</p></div>}
        </section>}

        <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-white/10 bg-black/70 p-1 backdrop-blur-md player-controls">
          <Button variant="ghost" size="icon" aria-label="Canal anterior" onClick={() => changeChannel(-1)} className="text-white hover:bg-white/15"><ChevronUp /></Button>
          <Button variant="ghost" size="icon" aria-label="Tela cheia" onClick={toggleFullscreen} className="text-white hover:bg-white/15"><Maximize /></Button>
          <Button variant="ghost" size="icon" aria-label="Próximo canal" onClick={() => changeChannel(1)} className="text-white hover:bg-white/15"><ChevronDown /></Button>
        </div>
      </div>
    </div>
  )
}
